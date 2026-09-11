import type {
  LlmBackendOptionDto,
  LlmBackendStatusResponse_unstable,
} from '@aaif/goose-acp-client';
import { getAcpClient } from './acpConnection';

export type LlmBackendStatus = LlmBackendStatusResponse_unstable;
export type LlmBackendOption = LlmBackendOptionDto;

export const UNSUPPORTED_LLM_BACKEND: LlmBackendStatus = { supported: false, options: [] };

export async function acpReadLlmBackend(sessionId: string): Promise<LlmBackendStatus> {
  const client = await getAcpClient();
  return client.goose.sessionLlmBackendRead_unstable({ sessionId });
}

export async function acpSetLlmBackend(
  sessionId: string,
  backend: string | null,
  options: { signIn?: boolean; currentModel?: string | null } = {}
): Promise<LlmBackendStatus> {
  const client = await getAcpClient();
  return client.goose.sessionLlmBackendSet_unstable({
    sessionId,
    backend,
    signIn: options.signIn ?? false,
    currentModel: options.currentModel ?? null,
  });
}

export async function acpConfigureLlmBackend(
  sessionId: string,
  vertex: { projectId: string; region: string } | null,
  vertexModel?: string
): Promise<LlmBackendStatus> {
  const client = await getAcpClient();
  return client.goose.sessionLlmBackendConfigure_unstable({
    sessionId,
    vertex,
    vertexModel: vertexModel ?? null,
  });
}

// Signing in opens a browser, so the caller asks for it up front only when the
// credentials are already known to be unusable.
export function needsGoogleCloudSignIn(status: LlmBackendStatus, backendId: string): boolean {
  return backendId === 'vertex' && (status.googleCloud?.state ?? 'not_configured') !== 'ready';
}

// An agent left on its own routing has no option row, so name it for what it is
// rather than leaving a sentence with a hole in it.
export function backendLabel(
  status: LlmBackendStatus,
  backendId: string | null | undefined
): string {
  return (
    status.options.find((option) => option.id === backendId)?.label ?? 'the agent’s own login'
  );
}
