//! Cross-process ownership of a session's running turn.
//!
//! The active-run registry lives in one server's memory, so a second goose
//! server on the same session store (a second desktop instance, say) sees a
//! session busy in the first as idle. Starting a turn there would put a second
//! agent on a conversation that is mid-turn, and both would write to it. A
//! running turn therefore also holds an exclusive advisory lock on a file per
//! session; the OS drops the lock when the holder exits, so a crash leaves
//! nothing stale behind.

use std::fs::{self, File, OpenOptions, TryLockError};
use std::io;
use std::path::{Path, PathBuf};
use std::time::Duration;

const LOCK_DIR: &str = "run-locks";

// `is_held` probes with a shared lock for an instant; a turn starting in that
// instant would otherwise be refused, so acquisition retries briefly.
const ACQUIRE_ATTEMPTS: u32 = 5;
const ACQUIRE_RETRY_DELAY: Duration = Duration::from_millis(5);

pub(crate) fn lock_dir(data_dir: &Path) -> PathBuf {
    data_dir.join(LOCK_DIR)
}

fn lock_path(dir: &Path, session_id: &str) -> PathBuf {
    let name: String = session_id
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect();
    dir.join(format!("{name}.lock"))
}

fn open_lock_file(dir: &Path, session_id: &str) -> io::Result<File> {
    fs::create_dir_all(dir)?;
    // The file is never deleted: unlinking a lock file while another process
    // has it open lets two processes each lock a different inode.
    OpenOptions::new()
        .create(true)
        .truncate(false)
        .write(true)
        .open(lock_path(dir, session_id))
}

/// Held for the life of a running turn; dropping it releases the lock.
#[derive(Debug)]
pub(crate) struct RunLock {
    _file: File,
}

impl RunLock {
    /// `Ok(None)` when another process is running a turn in this session.
    pub(crate) async fn try_acquire(dir: &Path, session_id: &str) -> io::Result<Option<Self>> {
        let file = open_lock_file(dir, session_id)?;
        for attempt in 1..=ACQUIRE_ATTEMPTS {
            match file.try_lock() {
                Ok(()) => return Ok(Some(Self { _file: file })),
                Err(TryLockError::WouldBlock) if attempt < ACQUIRE_ATTEMPTS => {
                    tokio::time::sleep(ACQUIRE_RETRY_DELAY).await;
                }
                Err(TryLockError::WouldBlock) => return Ok(None),
                Err(TryLockError::Error(error)) => return Err(error),
            }
        }
        Ok(None)
    }
}

/// Whether any process, this one included, is running a turn in the session.
/// An unreadable lock directory counts as not held: the probe only informs the
/// UI, and acquisition still enforces exclusivity.
pub(crate) fn is_held(dir: &Path, session_id: &str) -> bool {
    let path = lock_path(dir, session_id);
    let Ok(file) = File::open(&path) else {
        return false;
    };
    match file.try_lock_shared() {
        Ok(()) => {
            let _ = file.unlock();
            false
        }
        Err(TryLockError::WouldBlock) => true,
        Err(TryLockError::Error(_)) => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn a_held_lock_refuses_a_second_holder_until_released() {
        let dir = tempfile::tempdir().unwrap();
        let first = RunLock::try_acquire(dir.path(), "session-1")
            .await
            .unwrap()
            .expect("first acquire succeeds");
        assert!(is_held(dir.path(), "session-1"));
        assert!(RunLock::try_acquire(dir.path(), "session-1")
            .await
            .unwrap()
            .is_none());

        drop(first);
        assert!(!is_held(dir.path(), "session-1"));
        assert!(RunLock::try_acquire(dir.path(), "session-1")
            .await
            .unwrap()
            .is_some());
    }

    #[tokio::test]
    async fn sessions_lock_independently() {
        let dir = tempfile::tempdir().unwrap();
        let _first = RunLock::try_acquire(dir.path(), "session-1")
            .await
            .unwrap()
            .unwrap();
        assert!(!is_held(dir.path(), "session-2"));
        assert!(RunLock::try_acquire(dir.path(), "session-2")
            .await
            .unwrap()
            .is_some());
    }

    #[test]
    fn a_session_that_never_ran_is_not_held() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!is_held(dir.path(), "never-ran"));
    }

    #[test]
    fn unsafe_characters_cannot_escape_the_lock_directory() {
        let dir = Path::new("/locks");
        assert_eq!(
            lock_path(dir, "../etc/passwd"),
            PathBuf::from("/locks/___etc_passwd.lock")
        );
    }
}
