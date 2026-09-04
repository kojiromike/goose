import type { Stream } from "@agentclientprotocol/sdk";
/**
 * Stream that speaks the ACP Streamable HTTP transport: a connection-scoped
 * GET SSE stream plus a session-scoped stream per active `sessionId`.
 */
export declare function createHttpStream(serverUrl: string): Stream;
//# sourceMappingURL=http-stream.d.ts.map