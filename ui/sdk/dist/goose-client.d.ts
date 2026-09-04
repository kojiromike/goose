import { type Stream, type InitializeRequest, type InitializeResponse, type NewSessionRequest, type NewSessionResponse, type LoadSessionRequest, type LoadSessionResponse, type PromptRequest, type PromptResponse, type CancelNotification, type AuthenticateRequest, type AuthenticateResponse, type SetSessionModeRequest, type SetSessionModeResponse, type SetSessionConfigOptionRequest, type SetSessionConfigOptionResponse, type ForkSessionRequest, type ForkSessionResponse, type ListSessionsRequest, type ListSessionsResponse, type ResumeSessionRequest, type ResumeSessionResponse, type CloseSessionRequest, type CloseSessionResponse, type SetSessionModelRequest, type SetSessionModelResponse } from "@agentclientprotocol/sdk";
import { GooseExtClient, type GooseClientCallbacks } from "./generated/client.gen.js";
export declare class GooseClient {
    private conn;
    private ext;
    constructor(toClient: () => GooseClientCallbacks, streamOrUrl: Stream | string);
    get signal(): AbortSignal;
    get closed(): Promise<void>;
    initialize(params: InitializeRequest): Promise<InitializeResponse>;
    newSession(params: NewSessionRequest): Promise<NewSessionResponse>;
    loadSession(params: LoadSessionRequest): Promise<LoadSessionResponse>;
    prompt(params: PromptRequest): Promise<PromptResponse>;
    cancel(params: CancelNotification): Promise<void>;
    authenticate(params: AuthenticateRequest): Promise<AuthenticateResponse>;
    setSessionMode(params: SetSessionModeRequest): Promise<SetSessionModeResponse>;
    setSessionConfigOption(params: SetSessionConfigOptionRequest): Promise<SetSessionConfigOptionResponse>;
    unstable_forkSession(params: ForkSessionRequest): Promise<ForkSessionResponse>;
    listSessions(params: ListSessionsRequest): Promise<ListSessionsResponse>;
    unstable_resumeSession(params: ResumeSessionRequest): Promise<ResumeSessionResponse>;
    unstable_closeSession(params: CloseSessionRequest): Promise<CloseSessionResponse>;
    unstable_setSessionModel(params: SetSessionModelRequest): Promise<SetSessionModelResponse>;
    extMethod(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>>;
    get goose(): GooseExtClient;
}
//# sourceMappingURL=goose-client.d.ts.map