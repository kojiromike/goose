import https from 'node:https';
import type { IncomingMessage } from 'node:http';
import type { TLSSocket } from 'node:tls';

export interface ReadinessProbeResponse {
  ok: boolean;
}

export type ReadinessProbe = (
  input: string,
  init?: { signal?: AbortSignal | null }
) => Promise<ReadinessProbeResponse>;

type HttpsGet = (
  url: URL,
  options: https.RequestOptions,
  callback: (response: IncomingMessage) => void
) => { on(event: 'error', listener: (error: Error) => void): unknown };

/**
 * Probe the local goose serve over Node's TLS stack instead of Electron's
 * `net.fetch`. Chromium's network service reads the app's Safe Storage key from
 * the macOS keychain before its first request, and on a build the keychain does
 * not yet trust that read waits on a prompt. Every probe then times out until
 * the startup deadline kills a server that was healthy all along. The probe
 * still pins the certificate through the same trust check as the sessions.
 */
export function createBackendReadinessProbe(
  verify: (hostname: string, fingerprint: string) => boolean,
  get: HttpsGet = https.get
): ReadinessProbe {
  return (input, init) =>
    new Promise((resolve, reject) => {
      const url = new URL(input);
      const request = get(
        url,
        {
          // The trust check below replaces CA validation for the self-signed cert.
          rejectUnauthorized: false,
          signal: init?.signal ?? undefined,
        },
        (response) => {
          const fingerprint = (response.socket as TLSSocket).getPeerCertificate?.()?.fingerprint256;
          if (!fingerprint || !verify(url.hostname, fingerprint)) {
            response.destroy();
            reject(new Error(`Untrusted certificate for ${url.hostname}`));
            return;
          }
          response.resume();
          const status = response.statusCode ?? 0;
          resolve({ ok: status >= 200 && status < 300 });
        }
      );
      request.on('error', reject);
    });
}
