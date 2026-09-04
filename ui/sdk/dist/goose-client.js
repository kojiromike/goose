import { ClientSideConnection, } from "@agentclientprotocol/sdk";
import { GooseExtClient, installGooseExtAgentRequestDispatcher, installGooseExtNotificationDispatcher, } from "./generated/client.gen.js";
import { createHttpStream } from "./http-stream.js";
export class GooseClient {
    conn;
    ext;
    constructor(toClient, streamOrUrl) {
        const stream = typeof streamOrUrl === "string"
            ? createHttpStream(streamOrUrl)
            : streamOrUrl;
        const toAcpClient = () => installGooseExtAgentRequestDispatcher(installGooseExtNotificationDispatcher(toClient()));
        this.conn = new ClientSideConnection(toAcpClient, stream);
        this.ext = new GooseExtClient(this.conn);
    }
    get signal() {
        return this.conn.signal;
    }
    get closed() {
        return this.conn.closed;
    }
    initialize(params) {
        return this.conn.initialize(params);
    }
    newSession(params) {
        return this.conn.newSession(params);
    }
    loadSession(params) {
        return this.conn.loadSession(params);
    }
    prompt(params) {
        return this.conn.prompt(params);
    }
    cancel(params) {
        return this.conn.cancel(params);
    }
    authenticate(params) {
        return this.conn.authenticate(params);
    }
    setSessionMode(params) {
        return this.conn.setSessionMode(params);
    }
    setSessionConfigOption(params) {
        return this.conn.setSessionConfigOption(params);
    }
    unstable_forkSession(params) {
        return this.conn.unstable_forkSession(params);
    }
    listSessions(params) {
        return this.conn.listSessions(params);
    }
    unstable_resumeSession(params) {
        return this.conn.unstable_resumeSession(params);
    }
    unstable_closeSession(params) {
        return this.conn.unstable_closeSession(params);
    }
    unstable_setSessionModel(params) {
        return this.conn.unstable_setSessionModel(params);
    }
    extMethod(method, params) {
        return this.conn.extMethod(method, params);
    }
    get goose() {
        return this.ext;
    }
}
