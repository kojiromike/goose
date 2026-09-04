import * as z from 'zod';
/**
 * An HTTP header to set when making requests to the MCP server.
 */
export declare const zHttpHeader: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * HTTP transport configuration for MCP.
 */
export declare const zMcpServerHttp: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    headers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"http">;
}, z.core.$strip>;
/**
 * SSE transport configuration for MCP.
 */
export declare const zMcpServerSse: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    headers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"sse">;
}, z.core.$strip>;
/**
 * An environment variable to set when launching an MCP server.
 */
export declare const zEnvVariable: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Stdio transport configuration for MCP.
 */
export declare const zMcpServerStdio: z.ZodObject<{
    name: z.ZodString;
    command: z.ZodString;
    args: z.ZodArray<z.ZodString>;
    env: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Configuration for connecting to an MCP (Model Context Protocol) server.
 *
 * MCP servers provide tools and context that the agent can use when
 * processing prompts.
 *
 * See protocol docs: [MCP Servers](https://agentclientprotocol.com/protocol/session-setup#mcp-servers)
 */
export declare const zMcpServer: z.ZodUnion<readonly [z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    headers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"http">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    headers: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"sse">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    command: z.ZodString;
    args: z.ZodArray<z.ZodString>;
    env: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        value: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>]>;
export declare const zGooseExtension: z.ZodUnion<readonly [z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"builtin">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"platform">;
}, z.core.$strip>, z.ZodObject<{
    server: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        headers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"http">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        headers: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"sse">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        command: z.ZodString;
        args: z.ZodArray<z.ZodString>;
        env: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>]>;
    envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"mcp">;
}, z.core.$strip>]>;
/**
 * Add an extension to an active session.
 */
export declare const zAddSessionExtensionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    extension: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"platform">;
    }, z.core.$strip>, z.ZodObject<{
        server: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"http">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"sse">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            command: z.ZodString;
            args: z.ZodArray<z.ZodString>;
            env: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>]>;
        envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"mcp">;
    }, z.core.$strip>]>;
}, z.core.$strip>;
/**
 * Empty success response for operations that return no data.
 */
export declare const zEmptyResponse: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/**
 * Remove an extension from an active session.
 */
export declare const zRemoveSessionExtensionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    extensionKey: z.ZodString;
}, z.core.$strip>;
/**
 * List all tools available in a session.
 */
export declare const zGetToolsRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    extensionName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Permission level for a tool.
 */
export declare const zToolPermissionLevel: z.ZodEnum<{
    always_allow: "always_allow";
    ask_before: "ask_before";
    never_allow: "never_allow";
}>;
/**
 * A single tool item returned by the tools list endpoint.
 */
export declare const zToolListItem: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodArray<z.ZodString>;
    permission: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        always_allow: "always_allow";
        ask_before: "ask_before";
        never_allow: "never_allow";
    }>>>;
    inputSchema: z.ZodUnknown;
    outputSchema: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
/**
 * Tools response.
 */
export declare const zGetToolsResponse_unstable: z.ZodObject<{
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodArray<z.ZodString>;
        permission: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            always_allow: "always_allow";
            ask_before: "ask_before";
            never_allow: "never_allow";
        }>>>;
        inputSchema: z.ZodUnknown;
        outputSchema: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * A single tool permission entry.
 */
export declare const zToolPermissionEntry: z.ZodObject<{
    toolName: z.ZodString;
    permission: z.ZodEnum<{
        always_allow: "always_allow";
        ask_before: "ask_before";
        never_allow: "never_allow";
    }>;
}, z.core.$strip>;
/**
 * Set permission levels for one or more tools.
 */
export declare const zSetToolPermissionsRequest_unstable: z.ZodObject<{
    toolPermissions: z.ZodArray<z.ZodObject<{
        toolName: z.ZodString;
        permission: z.ZodEnum<{
            always_allow: "always_allow";
            ask_before: "ask_before";
            never_allow: "never_allow";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zSetToolPermissionsResponse_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/**
 * Call a tool from an extension.
 */
export declare const zGooseToolCallRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    name: z.ZodString;
    arguments: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
}, z.core.$strip>;
/**
 * Tool call response.
 */
export declare const zGooseToolCallResponse_unstable: z.ZodObject<{
    content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnknown>>>;
    structuredContent: z.ZodOptional<z.ZodUnknown>;
    isError: z.ZodBoolean;
    _meta: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
/**
 * Read a resource from an extension.
 */
export declare const zReadResourceRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    uri: z.ZodString;
    extensionName: z.ZodString;
}, z.core.$strip>;
/**
 * Resource read response.
 */
export declare const zReadResourceResponse_unstable: z.ZodObject<{
    result: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
}, z.core.$strip>;
export declare const zAppsListRequest_unstable: z.ZodObject<{
    sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zAppsListResponse_unstable: z.ZodObject<{
    apps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const zAppsExportRequest_unstable: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const zAppsExportResponse_unstable: z.ZodObject<{
    html: z.ZodString;
}, z.core.$strip>;
export declare const zAppsImportRequest_unstable: z.ZodObject<{
    html: z.ZodString;
}, z.core.$strip>;
export declare const zAppsImportResponse_unstable: z.ZodObject<{
    name: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
export declare const zAppsDeleteRequest_unstable: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const zAppsDeleteResponse_unstable: z.ZodObject<{
    name: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
/**
 * Update the working directory for a session.
 */
export declare const zUpdateWorkingDirRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    workingDir: z.ZodString;
}, z.core.$strip>;
/**
 * How a session system prompt update should be applied.
 */
export declare const zSessionSystemPromptMode: z.ZodUnion<readonly [z.ZodLiteral<"set">, z.ZodLiteral<"append">]>;
/**
 * Set, append, or clear system prompt text for a session.
 *
 * `mode: "set"` replaces Goose's base system prompt. `mode: "append"` adds an
 * instruction under "Additional Instructions". Reusing a key replaces the
 * previous value for that mode/key; sending empty text clears it.
 */
export declare const zSetSessionSystemPromptRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    mode: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"set">, z.ZodLiteral<"append">]>>>;
    key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    text: z.ZodString;
}, z.core.$strip>;
/**
 * The sender or recipient of messages and data in a conversation.
 */
export declare const zRole: z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>;
/**
 * Optional annotations for the client. The client can use annotations to inform how objects are used or displayed
 */
export declare const zAnnotations: z.ZodObject<{
    audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
    lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Text provided to or from an LLM.
 */
export declare const zTextContent: z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    text: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * An image provided to or from an LLM.
 */
export declare const zImageContent: z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    uri: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Audio provided to or from an LLM.
 */
export declare const zAudioContent: z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 */
export declare const zResourceLink: z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    size: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Text-based resource contents.
 */
export declare const zTextResourceContents: z.ZodObject<{
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    text: z.ZodString;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Binary resource contents.
 */
export declare const zBlobResourceContents: z.ZodObject<{
    blob: z.ZodString;
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Resource content that can be embedded in a message.
 */
export declare const zEmbeddedResourceResource: z.ZodUnion<readonly [z.ZodObject<{
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    text: z.ZodString;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>, z.ZodObject<{
    blob: z.ZodString;
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>]>;
/**
 * The contents of a resource, embedded into a prompt or tool call result.
 */
export declare const zEmbeddedResource: z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    resource: z.ZodUnion<readonly [z.ZodObject<{
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        text: z.ZodString;
        uri: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>, z.ZodObject<{
        blob: z.ZodString;
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        uri: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>]>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Content blocks represent displayable information in the Agent Client Protocol.
 *
 * They provide a structured way to handle various types of user-facing content—whether
 * it's text from language models, images for analysis, or embedded resources for context.
 *
 * Content blocks appear in:
 * - User prompts sent via `session/prompt`
 * - Language model output streamed through `session/update` notifications
 * - Progress updates and results from tool calls
 *
 * This structure is compatible with the Model Context Protocol (MCP), enabling
 * agents to seamlessly forward content from MCP tool outputs without transformation.
 *
 * See protocol docs: [Content](https://agentclientprotocol.com/protocol/content)
 */
export declare const zContentBlock: z.ZodDiscriminatedUnion<[z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    text: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"TextContent">;
}, z.core.$strip>, z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    uri: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"ImageContent">;
}, z.core.$strip>, z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    data: z.ZodString;
    mimeType: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"AudioContent">;
}, z.core.$strip>, z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    size: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uri: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"ResourceLink">;
}, z.core.$strip>, z.ZodObject<{
    annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
        lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    resource: z.ZodUnion<readonly [z.ZodObject<{
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        text: z.ZodString;
        uri: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>, z.ZodObject<{
        blob: z.ZodString;
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        uri: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>]>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    type: z.ZodLiteral<"EmbeddedResource">;
}, z.core.$strip>], "type">;
/**
 * Add user input to the currently active prompt without starting a new prompt.
 */
export declare const zSteerSessionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    prompt: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
            lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        text: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"TextContent">;
    }, z.core.$strip>, z.ZodObject<{
        annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
            lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        uri: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"ImageContent">;
    }, z.core.$strip>, z.ZodObject<{
        annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
            lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        data: z.ZodString;
        mimeType: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"AudioContent">;
    }, z.core.$strip>, z.ZodObject<{
        annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
            lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
        size: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        uri: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"ResourceLink">;
    }, z.core.$strip>, z.ZodObject<{
        annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
            lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        resource: z.ZodUnion<readonly [z.ZodObject<{
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            text: z.ZodString;
            uri: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>, z.ZodObject<{
            blob: z.ZodString;
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>]>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        type: z.ZodLiteral<"EmbeddedResource">;
    }, z.core.$strip>], "type">>>>;
    expectedRunId: z.ZodString;
}, z.core.$strip>;
export declare const zSteerSessionResponse_unstable: z.ZodObject<{
    runId: z.ZodString;
    messageId: z.ZodString;
}, z.core.$strip>;
export declare const zDiagnosticsReportLevel: z.ZodEnum<{
    summary: "summary";
    full: "full";
}>;
export declare const zDiagnosticsGetRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    level: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        summary: "summary";
        full: "full";
    }>>>;
}, z.core.$strip>;
export declare const zDiagnosticsGetResponse_unstable: z.ZodObject<{
    report: z.ZodUnknown;
}, z.core.$strip>;
/**
 * List all available Goose prompt templates.
 */
export declare const zListPromptsRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/**
 * Information about a prompt template, including its default content and customization status.
 */
export declare const zPromptTemplateEntry: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    defaultContent: z.ZodString;
    userContent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    isCustomized: z.ZodBoolean;
}, z.core.$strip>;
export declare const zListPromptsResponse_unstable: z.ZodObject<{
    prompts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        defaultContent: z.ZodString;
        userContent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        isCustomized: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Read a Goose prompt template.
 */
export declare const zGetPromptRequest_unstable: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
export declare const zGetPromptResponse_unstable: z.ZodObject<{
    name: z.ZodString;
    content: z.ZodString;
    defaultContent: z.ZodString;
    isCustomized: z.ZodBoolean;
}, z.core.$strip>;
/**
 * Save a custom Goose prompt template.
 */
export declare const zSavePromptRequest_unstable: z.ZodObject<{
    name: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export declare const zPromptOperationResponse_unstable: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
/**
 * Reset a Goose prompt template to its default content.
 */
export declare const zResetPromptRequest_unstable: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strip>;
/**
 * List configured extensions and any warnings.
 */
export declare const zGetConfigExtensionsRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zGooseExtensionEntry: z.ZodObject<{
    extension: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"platform">;
    }, z.core.$strip>, z.ZodObject<{
        server: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"http">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"sse">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            command: z.ZodString;
            args: z.ZodArray<z.ZodString>;
            env: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>]>;
        envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"mcp">;
    }, z.core.$strip>]>;
    enabled: z.ZodBoolean;
    configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * List configured extensions and any warnings.
 */
export declare const zGetConfigExtensionsResponse_unstable: z.ZodObject<{
    extensions: z.ZodArray<z.ZodObject<{
        extension: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            server: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"http">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"sse">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                command: z.ZodString;
                args: z.ZodArray<z.ZodString>;
                env: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>]>;
            envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"mcp">;
        }, z.core.$strip>]>;
        enabled: z.ZodBoolean;
        configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
/**
 * Persist a new extension to the user's global goose config.
 */
export declare const zAddConfigExtensionRequest_unstable: z.ZodObject<{
    extension: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"platform">;
    }, z.core.$strip>, z.ZodObject<{
        server: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"http">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"sse">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            command: z.ZodString;
            args: z.ZodArray<z.ZodString>;
            env: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>]>;
        envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"mcp">;
    }, z.core.$strip>]>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
/**
 * Remove a persisted extension from the user's global goose config.
 */
export declare const zRemoveConfigExtensionRequest_unstable: z.ZodObject<{
    configKey: z.ZodString;
}, z.core.$strip>;
/**
 * Set the `enabled` flag for a persisted extension in the user's global goose config.
 */
export declare const zSetConfigExtensionEnabledRequest_unstable: z.ZodObject<{
    configKey: z.ZodString;
    enabled: z.ZodBoolean;
}, z.core.$strip>;
export declare const zGetSessionExtensionsRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
}, z.core.$strip>;
export declare const zSessionExtensionEntry: z.ZodObject<{
    extension: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"platform">;
    }, z.core.$strip>, z.ZodObject<{
        server: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"http">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            headers: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"sse">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            command: z.ZodString;
            args: z.ZodArray<z.ZodString>;
            env: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                value: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>]>;
        envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"mcp">;
    }, z.core.$strip>]>;
    extensionKey: z.ZodString;
}, z.core.$strip>;
export declare const zGetSessionExtensionsResponse_unstable: z.ZodObject<{
    extensions: z.ZodArray<z.ZodObject<{
        extension: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            server: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"http">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"sse">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                command: z.ZodString;
                args: z.ZodArray<z.ZodString>;
                env: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>]>;
            envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"mcp">;
        }, z.core.$strip>]>;
        extensionKey: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List providers with setup metadata and the current model inventory snapshot.
 */
export declare const zListProvidersRequest_unstable: z.ZodObject<{
    providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const zProviderSetupCategoryDto: z.ZodEnum<{
    agent: "agent";
    model: "model";
}>;
export declare const zProviderConfigKey: z.ZodObject<{
    name: z.ZodString;
    required: z.ZodBoolean;
    secret: z.ZodBoolean;
    default: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    oauthFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    deviceCodeFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    primary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
/**
 * A single model in provider inventory.
 */
export declare const zProviderInventoryModelDto: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    family: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contextLimit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    reasoning: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    recommended: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
/**
 * Provider inventory entry.
 */
export declare const zProviderInventoryEntryDto: z.ZodObject<{
    providerId: z.ZodString;
    providerName: z.ZodString;
    description: z.ZodString;
    defaultModel: z.ZodString;
    configured: z.ZodBoolean;
    available: z.ZodBoolean;
    providerType: z.ZodString;
    category: z.ZodEnum<{
        agent: "agent";
        model: "model";
    }>;
    acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    visibleInSetup: z.ZodBoolean;
    deprecated: z.ZodBoolean;
    replacement: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    configKeys: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        required: z.ZodBoolean;
        secret: z.ZodBoolean;
        default: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        oauthFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        deviceCodeFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        primary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
    setupSteps: z.ZodArray<z.ZodString>;
    supportsRefresh: z.ZodBoolean;
    refreshing: z.ZodBoolean;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        family: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contextLimit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        reasoning: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        recommended: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
    lastUpdatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastRefreshAttemptAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lastRefreshError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    stale: z.ZodBoolean;
    modelSelectionHint: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Provider list response.
 */
export declare const zListProvidersResponse_unstable: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        providerId: z.ZodString;
        providerName: z.ZodString;
        description: z.ZodString;
        defaultModel: z.ZodString;
        configured: z.ZodBoolean;
        available: z.ZodBoolean;
        providerType: z.ZodString;
        category: z.ZodEnum<{
            agent: "agent";
            model: "model";
        }>;
        acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        visibleInSetup: z.ZodBoolean;
        deprecated: z.ZodBoolean;
        replacement: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        configKeys: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            required: z.ZodBoolean;
            secret: z.ZodBoolean;
            default: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            oauthFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            deviceCodeFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            primary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>;
        setupSteps: z.ZodArray<z.ZodString>;
        supportsRefresh: z.ZodBoolean;
        refreshing: z.ZodBoolean;
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            family: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            contextLimit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            reasoning: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            recommended: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>;
        lastUpdatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastRefreshAttemptAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lastRefreshError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        stale: z.ZodBoolean;
        modelSelectionHint: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List the raw model identifiers returned by a provider's live supported-models API.
 */
export declare const zProviderSupportedModelsListRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zProviderSupportedModelsListResponse_unstable: z.ZodObject<{
    providerId: z.ZodString;
    models: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
/**
 * List custom-provider catalog entries. Omit `format` to list all formats.
 */
export declare const zProviderCatalogListRequest_unstable: z.ZodObject<{
    format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zProviderTemplateCatalogEntryDto: z.ZodObject<{
    providerId: z.ZodString;
    name: z.ZodString;
    format: z.ZodString;
    apiUrl: z.ZodString;
    modelCount: z.ZodInt;
    docUrl: z.ZodString;
    envVar: z.ZodString;
}, z.core.$strip>;
export declare const zProviderCatalogListResponse_unstable: z.ZodObject<{
    providers: z.ZodArray<z.ZodObject<{
        providerId: z.ZodString;
        name: z.ZodString;
        format: z.ZodString;
        apiUrl: z.ZodString;
        modelCount: z.ZodInt;
        docUrl: z.ZodString;
        envVar: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List provider setup catalog entries
 */
export declare const zProviderSetupCatalogListRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zProviderSetupMethodDto: z.ZodEnum<{
    none: "none";
    single_api_key: "single_api_key";
    config_fields: "config_fields";
    host_with_oauth_fallback: "host_with_oauth_fallback";
    oauth_browser: "oauth_browser";
    oauth_device_code: "oauth_device_code";
    cloud_credentials: "cloud_credentials";
    local: "local";
    cli_auth: "cli_auth";
}>;
export declare const zProviderSetupFieldDto: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    secret: z.ZodBoolean;
    required: z.ZodBoolean;
    placeholder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zProviderSetupGroupDto: z.ZodEnum<{
    default: "default";
    additional: "additional";
}>;
export declare const zProviderSetupCatalogEntryDto: z.ZodObject<{
    providerId: z.ZodString;
    name: z.ZodString;
    category: z.ZodEnum<{
        agent: "agent";
        model: "model";
    }>;
    acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodString;
    setupMethod: z.ZodEnum<{
        none: "none";
        single_api_key: "single_api_key";
        config_fields: "config_fields";
        host_with_oauth_fallback: "host_with_oauth_fallback";
        oauth_browser: "oauth_browser";
        oauth_device_code: "oauth_device_code";
        cloud_credentials: "cloud_credentials";
        local: "local";
        cli_auth: "cli_auth";
    }>;
    nativeConnectQuery: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        label: z.ZodString;
        secret: z.ZodBoolean;
        required: z.ZodBoolean;
        placeholder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>>;
    binaryName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    docUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    group: z.ZodEnum<{
        default: "default";
        additional: "additional";
    }>;
    showOnlyWhenInstalled: z.ZodBoolean;
    aliases: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    supportsInstall: z.ZodBoolean;
    supportsAuth: z.ZodBoolean;
    supportsAuthStatus: z.ZodBoolean;
}, z.core.$strip>;
export declare const zProviderSetupCatalogListResponse_unstable: z.ZodObject<{
    providers: z.ZodArray<z.ZodObject<{
        providerId: z.ZodString;
        name: z.ZodString;
        category: z.ZodEnum<{
            agent: "agent";
            model: "model";
        }>;
        acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        description: z.ZodString;
        setupMethod: z.ZodEnum<{
            none: "none";
            single_api_key: "single_api_key";
            config_fields: "config_fields";
            host_with_oauth_fallback: "host_with_oauth_fallback";
            oauth_browser: "oauth_browser";
            oauth_device_code: "oauth_device_code";
            cloud_credentials: "cloud_credentials";
            local: "local";
            cli_auth: "cli_auth";
        }>;
        nativeConnectQuery: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        fields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodString;
            secret: z.ZodBoolean;
            required: z.ZodBoolean;
            placeholder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        binaryName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        docUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        group: z.ZodEnum<{
            default: "default";
            additional: "additional";
        }>;
        showOnlyWhenInstalled: z.ZodBoolean;
        aliases: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        supportsInstall: z.ZodBoolean;
        supportsAuth: z.ZodBoolean;
        supportsAuthStatus: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Return the editable template for one catalog provider.
 */
export declare const zProviderCatalogTemplateRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zProviderTemplateCapabilitiesDto: z.ZodObject<{
    toolCall: z.ZodBoolean;
    reasoning: z.ZodBoolean;
    attachment: z.ZodBoolean;
    temperature: z.ZodBoolean;
}, z.core.$strip>;
export declare const zProviderTemplateModelDto: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    contextLimit: z.ZodInt;
    capabilities: z.ZodObject<{
        toolCall: z.ZodBoolean;
        reasoning: z.ZodBoolean;
        attachment: z.ZodBoolean;
        temperature: z.ZodBoolean;
    }, z.core.$strip>;
    deprecated: z.ZodBoolean;
}, z.core.$strip>;
export declare const zProviderTemplateDto: z.ZodObject<{
    providerId: z.ZodString;
    name: z.ZodString;
    format: z.ZodString;
    apiUrl: z.ZodString;
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        contextLimit: z.ZodInt;
        capabilities: z.ZodObject<{
            toolCall: z.ZodBoolean;
            reasoning: z.ZodBoolean;
            attachment: z.ZodBoolean;
            temperature: z.ZodBoolean;
        }, z.core.$strip>;
        deprecated: z.ZodBoolean;
    }, z.core.$strip>>;
    supportsStreaming: z.ZodBoolean;
    envVar: z.ZodString;
    docUrl: z.ZodString;
}, z.core.$strip>;
export declare const zProviderCatalogTemplateResponse_unstable: z.ZodObject<{
    template: z.ZodObject<{
        providerId: z.ZodString;
        name: z.ZodString;
        format: z.ZodString;
        apiUrl: z.ZodString;
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            contextLimit: z.ZodInt;
            capabilities: z.ZodObject<{
                toolCall: z.ZodBoolean;
                reasoning: z.ZodBoolean;
                attachment: z.ZodBoolean;
                temperature: z.ZodBoolean;
            }, z.core.$strip>;
            deprecated: z.ZodBoolean;
        }, z.core.$strip>>;
        supportsStreaming: z.ZodBoolean;
        envVar: z.ZodString;
        docUrl: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Create a custom provider backed by Goose's declarative provider store.
 */
export declare const zCustomProviderCreateRequest_unstable: z.ZodObject<{
    engine: z.ZodString;
    displayName: z.ZodString;
    apiUrl: z.ZodString;
    apiKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    requiresAuth: z.ZodBoolean;
    catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preservesThinking: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zProviderConfigStatusDto: z.ZodObject<{
    providerId: z.ZodString;
    isConfigured: z.ZodBoolean;
}, z.core.$strip>;
export declare const zRefreshProviderInventorySkipReasonDto: z.ZodEnum<{
    unknown_provider: "unknown_provider";
    not_configured: "not_configured";
    does_not_support_refresh: "does_not_support_refresh";
    already_refreshing: "already_refreshing";
}>;
export declare const zRefreshProviderInventorySkipDto: z.ZodObject<{
    providerId: z.ZodString;
    reason: z.ZodEnum<{
        unknown_provider: "unknown_provider";
        not_configured: "not_configured";
        does_not_support_refresh: "does_not_support_refresh";
        already_refreshing: "already_refreshing";
    }>;
}, z.core.$strip>;
/**
 * Refresh acknowledgement.
 */
export declare const zRefreshProviderInventoryResponse_unstable: z.ZodObject<{
    started: z.ZodArray<z.ZodString>;
    skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        providerId: z.ZodString;
        reason: z.ZodEnum<{
            unknown_provider: "unknown_provider";
            not_configured: "not_configured";
            does_not_support_refresh: "does_not_support_refresh";
            already_refreshing: "already_refreshing";
        }>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const zCustomProviderCreateResponse_unstable: z.ZodObject<{
    providerId: z.ZodString;
    status: z.ZodObject<{
        providerId: z.ZodString;
        isConfigured: z.ZodBoolean;
    }, z.core.$strip>;
    refresh: z.ZodObject<{
        started: z.ZodArray<z.ZodString>;
        skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            reason: z.ZodEnum<{
                unknown_provider: "unknown_provider";
                not_configured: "not_configured";
                does_not_support_refresh: "does_not_support_refresh";
                already_refreshing: "already_refreshing";
            }>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Read a declarative provider config. Custom configs are editable; bundled configs are read-only.
 */
export declare const zCustomProviderReadRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zCustomProviderConfigDto: z.ZodObject<{
    providerId: z.ZodString;
    engine: z.ZodString;
    displayName: z.ZodString;
    apiUrl: z.ZodString;
    models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    requiresAuth: z.ZodBoolean;
    catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    apiKeyEnv: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    apiKeySet: z.ZodBoolean;
    preservesThinking: z.ZodBoolean;
}, z.core.$strip>;
export declare const zCustomProviderReadResponse_unstable: z.ZodObject<{
    provider: z.ZodObject<{
        providerId: z.ZodString;
        engine: z.ZodString;
        displayName: z.ZodString;
        apiUrl: z.ZodString;
        models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
        requiresAuth: z.ZodBoolean;
        catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        apiKeyEnv: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        apiKeySet: z.ZodBoolean;
        preservesThinking: z.ZodBoolean;
    }, z.core.$strip>;
    editable: z.ZodBoolean;
    status: z.ZodObject<{
        providerId: z.ZodString;
        isConfigured: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Update a custom provider backed by Goose's declarative provider store.
 */
export declare const zCustomProviderUpdateRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
    engine: z.ZodString;
    displayName: z.ZodString;
    apiUrl: z.ZodString;
    apiKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    requiresAuth: z.ZodBoolean;
    catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    preservesThinking: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zCustomProviderUpdateResponse_unstable: z.ZodObject<{
    providerId: z.ZodString;
    status: z.ZodObject<{
        providerId: z.ZodString;
        isConfigured: z.ZodBoolean;
    }, z.core.$strip>;
    refresh: z.ZodObject<{
        started: z.ZodArray<z.ZodString>;
        skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            reason: z.ZodEnum<{
                unknown_provider: "unknown_provider";
                not_configured: "not_configured";
                does_not_support_refresh: "does_not_support_refresh";
                already_refreshing: "already_refreshing";
            }>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Delete a custom provider from Goose's declarative provider store.
 */
export declare const zCustomProviderDeleteRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zCustomProviderDeleteResponse_unstable: z.ZodObject<{
    providerId: z.ZodString;
    refresh: z.ZodObject<{
        started: z.ZodArray<z.ZodString>;
        skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            reason: z.ZodEnum<{
                unknown_provider: "unknown_provider";
                not_configured: "not_configured";
                does_not_support_refresh: "does_not_support_refresh";
                already_refreshing: "already_refreshing";
            }>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Trigger a background refresh of provider inventories.
 */
export declare const zRefreshProviderInventoryRequest_unstable: z.ZodObject<{
    providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
/**
 * Check whether an ACP provider can initialize and create a session.
 */
export declare const zProviderReadinessCheckRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zProviderReadinessCheckResponse_unstable: z.ZodObject<{
    providerId: z.ZodString;
    ready: z.ZodBoolean;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Read saved configuration field values for one provider.
 */
export declare const zProviderConfigReadRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
export declare const zProviderConfigFieldValueDto: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    isSet: z.ZodBoolean;
    isSecret: z.ZodBoolean;
    required: z.ZodBoolean;
}, z.core.$strip>;
export declare const zProviderConfigReadResponse_unstable: z.ZodObject<{
    fields: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
        isSet: z.ZodBoolean;
        isSecret: z.ZodBoolean;
        required: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Return provider configured statuses. Empty provider_ids means all providers.
 */
export declare const zProviderConfigStatusRequest_unstable: z.ZodObject<{
    providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const zProviderConfigStatusResponse_unstable: z.ZodObject<{
    statuses: z.ZodArray<z.ZodObject<{
        providerId: z.ZodString;
        isConfigured: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zProviderConfigFieldUpdate: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
/**
 * Save provider configuration fields and start an inventory refresh when supported.
 */
export declare const zProviderConfigSaveRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
    fields: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zProviderConfigChangeResponse_unstable: z.ZodObject<{
    status: z.ZodObject<{
        providerId: z.ZodString;
        isConfigured: z.ZodBoolean;
    }, z.core.$strip>;
    refresh: z.ZodObject<{
        started: z.ZodArray<z.ZodString>;
        skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            reason: z.ZodEnum<{
                unknown_provider: "unknown_provider";
                not_configured: "not_configured";
                does_not_support_refresh: "does_not_support_refresh";
                already_refreshing: "already_refreshing";
            }>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Delete provider configuration fields and start an inventory refresh when supported.
 */
export declare const zProviderConfigDeleteRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
/**
 * Run a provider-owned native authentication flow and start an inventory refresh when supported.
 */
export declare const zProviderConfigAuthenticateRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
}, z.core.$strip>;
/**
 * List provider credentials stored locally by Goose.
 */
export declare const zProviderSecretsListRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zProviderSecretStorageDto: z.ZodEnum<{
    secret_store: "secret_store";
    provider_cache: "provider_cache";
}>;
export declare const zProviderSecretStatusDto: z.ZodEnum<{
    valid: "valid";
    expired: "expired";
    unknown: "unknown";
}>;
export declare const zProviderSecretDto: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodString;
    providerDisplayName: z.ZodString;
    name: z.ZodString;
    storage: z.ZodEnum<{
        secret_store: "secret_store";
        provider_cache: "provider_cache";
    }>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodEnum<{
        valid: "valid";
        expired: "expired";
        unknown: "unknown";
    }>;
    configured: z.ZodBoolean;
    hasSecret: z.ZodBoolean;
    canDelete: z.ZodBoolean;
    canConfigure: z.ZodBoolean;
    configureProvider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zProviderSecretsListResponse_unstable: z.ZodObject<{
    secrets: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodString;
        providerDisplayName: z.ZodString;
        name: z.ZodString;
        storage: z.ZodEnum<{
            secret_store: "secret_store";
            provider_cache: "provider_cache";
        }>;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodEnum<{
            valid: "valid";
            expired: "expired";
            unknown: "unknown";
        }>;
        configured: z.ZodBoolean;
        hasSecret: z.ZodBoolean;
        canDelete: z.ZodBoolean;
        canConfigure: z.ZodBoolean;
        configureProvider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Delete a locally stored provider credential by id.
 */
export declare const zProviderSecretDeleteRequest_unstable: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Look up canonical (bundled-registry) model info for a provider/model pair.
 */
export declare const zCanonicalModelInfoRequest_unstable: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strip>;
export declare const zCanonicalModelInfoDto: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
    contextLimit: z.ZodInt;
    maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    reasoning: z.ZodBoolean;
    inputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    outputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cacheReadTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cacheWriteTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    currency: z.ZodString;
}, z.core.$strip>;
export declare const zCanonicalModelInfoResponse_unstable: z.ZodObject<{
    modelInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
        contextLimit: z.ZodInt;
        maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        reasoning: z.ZodBoolean;
        inputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        outputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cacheReadTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cacheWriteTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        currency: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const zPreferenceKey: z.ZodEnum<{
    autoCompactThreshold: "autoCompactThreshold";
    gooseThinkingEffort: "gooseThinkingEffort";
    voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
    voiceDictationProvider: "voiceDictationProvider";
    voiceDictationPreferredMic: "voiceDictationPreferredMic";
}>;
/**
 * Read allowlisted user preferences. Empty `keys` means all supported preferences.
 */
export declare const zPreferencesReadRequest_unstable: z.ZodObject<{
    keys: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        autoCompactThreshold: "autoCompactThreshold";
        gooseThinkingEffort: "gooseThinkingEffort";
        voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
        voiceDictationProvider: "voiceDictationProvider";
        voiceDictationPreferredMic: "voiceDictationPreferredMic";
    }>>>>;
}, z.core.$strip>;
export declare const zPreferenceValue: z.ZodObject<{
    key: z.ZodEnum<{
        autoCompactThreshold: "autoCompactThreshold";
        gooseThinkingEffort: "gooseThinkingEffort";
        voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
        voiceDictationProvider: "voiceDictationProvider";
        voiceDictationPreferredMic: "voiceDictationPreferredMic";
    }>;
    value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
}, z.core.$strip>;
export declare const zPreferencesReadResponse_unstable: z.ZodObject<{
    values: z.ZodArray<z.ZodObject<{
        key: z.ZodEnum<{
            autoCompactThreshold: "autoCompactThreshold";
            gooseThinkingEffort: "gooseThinkingEffort";
            voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
            voiceDictationProvider: "voiceDictationProvider";
            voiceDictationPreferredMic: "voiceDictationPreferredMic";
        }>;
        value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Save allowlisted user preferences.
 */
export declare const zPreferencesSaveRequest_unstable: z.ZodObject<{
    values: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        key: z.ZodEnum<{
            autoCompactThreshold: "autoCompactThreshold";
            gooseThinkingEffort: "gooseThinkingEffort";
            voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
            voiceDictationProvider: "voiceDictationProvider";
            voiceDictationPreferredMic: "voiceDictationPreferredMic";
        }>;
        value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const zConfigReadRequest_unstable: z.ZodObject<{
    key: z.ZodString;
    isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zConfigReadResponse_unstable: z.ZodObject<{
    value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
}, z.core.$strip>;
export declare const zConfigUpsertRequest_unstable: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnknown;
    isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zConfigRemoveRequest_unstable: z.ZodObject<{
    key: z.ZodString;
    isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zConfigReadAllRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zConfigReadAllResponse_unstable: z.ZodObject<{
    config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
/**
 * Read Goose default provider and model configuration.
 */
export declare const zDefaultsReadRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zDefaultsReadResponse_unstable: z.ZodObject<{
    providerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Save Goose default provider and model configuration.
 */
export declare const zDefaultsSaveRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
    modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Clear Goose default provider and model configuration.
 */
export declare const zDefaultsClearRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
/**
 * Sources that onboarding knows how to discover and import.
 */
export declare const zOnboardingImportSourceKind: z.ZodEnum<{
    goose_config: "goose_config";
    claude_desktop: "claude_desktop";
}>;
/**
 * Scan for existing Goose and compatible app data that onboarding can import.
 */
export declare const zOnboardingImportScanRequest_unstable: z.ZodObject<{
    sources: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
        goose_config: "goose_config";
        claude_desktop: "claude_desktop";
    }>>>>;
}, z.core.$strip>;
export declare const zOnboardingImportCounts: z.ZodObject<{
    providers: z.ZodInt;
    extensions: z.ZodInt;
    sessions: z.ZodInt;
    skills: z.ZodInt;
    projects: z.ZodInt;
    preferences: z.ZodInt;
}, z.core.$strip>;
export declare const zOnboardingImportCandidate: z.ZodObject<{
    id: z.ZodString;
    sourceKind: z.ZodEnum<{
        goose_config: "goose_config";
        claude_desktop: "claude_desktop";
    }>;
    displayName: z.ZodString;
    path: z.ZodString;
    counts: z.ZodObject<{
        providers: z.ZodInt;
        extensions: z.ZodInt;
        sessions: z.ZodInt;
        skills: z.ZodInt;
        projects: z.ZodInt;
        preferences: z.ZodInt;
    }, z.core.$strip>;
    warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const zOnboardingImportScanResponse_unstable: z.ZodObject<{
    candidates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        sourceKind: z.ZodEnum<{
            goose_config: "goose_config";
            claude_desktop: "claude_desktop";
        }>;
        displayName: z.ZodString;
        path: z.ZodString;
        counts: z.ZodObject<{
            providers: z.ZodInt;
            extensions: z.ZodInt;
            sessions: z.ZodInt;
            skills: z.ZodInt;
            projects: z.ZodInt;
            preferences: z.ZodInt;
        }, z.core.$strip>;
        warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Import selected onboarding candidates.
 */
export declare const zOnboardingImportApplyRequest_unstable: z.ZodObject<{
    candidateIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    enableImportedExtensions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zOnboardingImportApplyResponse_unstable: z.ZodObject<{
    imported: z.ZodObject<{
        providers: z.ZodInt;
        extensions: z.ZodInt;
        sessions: z.ZodInt;
        skills: z.ZodInt;
        projects: z.ZodInt;
        preferences: z.ZodInt;
    }, z.core.$strip>;
    skipped: z.ZodObject<{
        providers: z.ZodInt;
        extensions: z.ZodInt;
        sessions: z.ZodInt;
        skills: z.ZodInt;
        projects: z.ZodInt;
        preferences: z.ZodInt;
    }, z.core.$strip>;
    warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    providerDefaults: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        providerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const zSessionExportFormat: z.ZodEnum<{
    json: "json";
    markdown: "markdown";
}>;
/**
 * Export a session as a JSON or markdown string.
 */
export declare const zExportSessionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        json: "json";
        markdown: "markdown";
    }>>>;
}, z.core.$strip>;
/**
 * Export session response — raw JSON of the goose session with `conversation`,
 * or a markdown transcript when `format` is `markdown`.
 */
export declare const zExportSessionResponse_unstable: z.ZodObject<{
    data: z.ZodString;
}, z.core.$strip>;
export declare const zSessionImportSource: z.ZodEnum<{
    json: "json";
    auto: "auto";
    nostr: "nostr";
}>;
/**
 * Import a session from a JSON string or share link.
 */
export declare const zImportSessionRequest_unstable: z.ZodObject<{
    input: z.ZodString;
    source: z.ZodEnum<{
        json: "json";
        auto: "auto";
        nostr: "nostr";
    }>;
}, z.core.$strip>;
/**
 * Import session response — metadata about the newly created session.
 */
export declare const zImportSessionResponse_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    messageCount: z.ZodInt;
}, z.core.$strip>;
/**
 * List the sessions an external agent provider already holds, so the user can
 * resume one instead of starting fresh. Only ACP-backed providers whose agent
 * advertises `sessionCapabilities.list` can answer this.
 */
export declare const zProviderSessionsListRequest_unstable: z.ZodObject<{
    providerId: z.ZodString;
    cwd: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
/**
 * One resumable session as reported by the external agent.
 */
export declare const zProviderSessionEntry: z.ZodObject<{
    sessionId: z.ZodString;
    cwd: z.ZodString;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zProviderSessionsListResponse_unstable: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        cwd: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zShareSessionNostrRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    relays: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const zShareSessionNostrResponse_unstable: z.ZodObject<{
    deeplink: z.ZodString;
    nevent: z.ZodString;
    eventId: z.ZodString;
    relays: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const zRecipeExtensionDto: z.ZodUnion<readonly [z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"builtin">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"platform">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cmd: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
    envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"stdio">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    uri: z.ZodString;
    envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    type: z.ZodLiteral<"streamable_http">;
}, z.core.$strip>]>;
export declare const zRecipeSettingsDto: z.ZodObject<{
    goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
export declare const zRecipeAuthorDto: z.ZodObject<{
    contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zRecipeParameterInputTypeDto: z.ZodEnum<{
    string: "string";
    number: "number";
    boolean: "boolean";
    date: "date";
    file: "file";
    select: "select";
}>;
export declare const zRecipeParameterRequirementDto: z.ZodEnum<{
    optional: "optional";
    required: "required";
    user_prompt: "user_prompt";
}>;
export declare const zRecipeParameterDto: z.ZodObject<{
    key: z.ZodString;
    input_type: z.ZodEnum<{
        string: "string";
        number: "number";
        boolean: "boolean";
        date: "date";
        file: "file";
        select: "select";
    }>;
    requirement: z.ZodEnum<{
        optional: "optional";
        required: "required";
        user_prompt: "user_prompt";
    }>;
    description: z.ZodString;
    default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export declare const zRecipeResponseDto: z.ZodObject<{
    json_schema: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const zSubRecipeDto: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
    sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zRecipeSuccessCheckDto: z.ZodObject<{
    command: z.ZodString;
    type: z.ZodLiteral<"shell">;
}, z.core.$strip>;
export declare const zRecipeRetryConfigDto: z.ZodObject<{
    max_retries: z.ZodInt;
    checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        type: z.ZodLiteral<"shell">;
    }, z.core.$strip>>>>;
    on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
export declare const zRecipeDto: z.ZodObject<{
    version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    description: z.ZodString;
    instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"platform">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cmd: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"stdio">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        uri: z.ZodString;
        envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
        bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        type: z.ZodLiteral<"streamable_http">;
    }, z.core.$strip>]>>>>;
    settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>>>;
    activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        input_type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            date: "date";
            file: "file";
            select: "select";
        }>;
        requirement: z.ZodEnum<{
            optional: "optional";
            required: "required";
            user_prompt: "user_prompt";
        }>;
        description: z.ZodString;
        default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>>>>;
    response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        json_schema: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>>;
    sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
        sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>>;
    retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        max_retries: z.ZodInt;
        checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            command: z.ZodString;
            type: z.ZodLiteral<"shell">;
        }, z.core.$strip>>>>;
        on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const zEncodeRecipeRequest_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zEncodeRecipeResponse_unstable: z.ZodObject<{
    deeplink: z.ZodString;
}, z.core.$strip>;
export declare const zDecodeRecipeRequest_unstable: z.ZodObject<{
    deeplink: z.ZodString;
}, z.core.$strip>;
export declare const zDecodeRecipeResponse_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zScanRecipeRequest_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zScanRecipeResponse_unstable: z.ZodObject<{
    has_security_warnings: z.ZodBoolean;
}, z.core.$strip>;
export declare const zListRecipesRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zRecipeListEntryDto: z.ZodObject<{
    id: z.ZodString;
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    file_path: z.ZodString;
    last_modified: z.ZodString;
    schedule_cron: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slash_command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zListRecipesResponse_unstable: z.ZodObject<{
    recipes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        file_path: z.ZodString;
        last_modified: z.ZodString;
        schedule_cron: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        slash_command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zDeleteRecipeRequest_unstable: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const zScheduleRecipeRequest_unstable: z.ZodObject<{
    id: z.ZodString;
    cron_schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zSetRecipeSlashCommandRequest_unstable: z.ZodObject<{
    id: z.ZodString;
    slash_command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zSaveRecipeRequest_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zSaveRecipeResponse_unstable: z.ZodObject<{
    id: z.ZodString;
    file_name: z.ZodString;
    file_path: z.ZodString;
}, z.core.$strip>;
export declare const zParseRecipeRequest_unstable: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
export declare const zParseRecipeResponse_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zRecipeToYamlRequest_unstable: z.ZodObject<{
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zRecipeToYamlResponse_unstable: z.ZodObject<{
    yaml: z.ZodString;
}, z.core.$strip>;
export declare const zListSchedulesRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zScheduledJobDto: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodString;
    cron: z.ZodString;
    lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    currentlyRunning: z.ZodBoolean;
    paused: z.ZodBoolean;
    currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zListSchedulesResponse_unstable: z.ZodObject<{
    jobs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        cron: z.ZodString;
        lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currentlyRunning: z.ZodBoolean;
        paused: z.ZodBoolean;
        currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zListScheduleSessionsRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
    limit: z.ZodInt;
}, z.core.$strip>;
/**
 * A unique identifier for a conversation session between a client and agent.
 *
 * Sessions maintain their own context, conversation history, and state,
 * allowing multiple independent interactions with the same agent.
 *
 * See protocol docs: [Session ID](https://agentclientprotocol.com/protocol/session-setup#session-id)
 */
export declare const zSessionId: z.ZodString;
/**
 * Information about a session returned by session/list
 */
export declare const zSessionInfo: z.ZodObject<{
    sessionId: z.ZodString;
    cwd: z.ZodString;
    additionalDirectories: z.ZodOptional<z.ZodArray<z.ZodString>>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const zListScheduleSessionsResponse_unstable: z.ZodObject<{
    sessions: z.ZodArray<z.ZodObject<{
        sessionId: z.ZodString;
        cwd: z.ZodString;
        additionalDirectories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zCreateScheduleRequest_unstable: z.ZodObject<{
    id: z.ZodString;
    recipe: z.ZodObject<{
        version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        title: z.ZodString;
        description: z.ZodString;
        instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cmd: z.ZodString;
            args: z.ZodOptional<z.ZodArray<z.ZodString>>;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"stdio">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"streamable_http">;
        }, z.core.$strip>]>>>>;
        settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
        activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>>>;
        response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            json_schema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>>;
        sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            path: z.ZodString;
            values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
            sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            max_retries: z.ZodInt;
            checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                command: z.ZodString;
                type: z.ZodLiteral<"shell">;
            }, z.core.$strip>>>>;
            on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    cron: z.ZodString;
}, z.core.$strip>;
export declare const zCreateScheduleResponse_unstable: z.ZodObject<{
    job: z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        cron: z.ZodString;
        lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currentlyRunning: z.ZodBoolean;
        paused: z.ZodBoolean;
        currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zDeleteScheduleRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
}, z.core.$strip>;
export declare const zPauseScheduleRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
}, z.core.$strip>;
export declare const zUnpauseScheduleRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
}, z.core.$strip>;
export declare const zUpdateScheduleRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
    cron: z.ZodString;
}, z.core.$strip>;
export declare const zUpdateScheduleResponse_unstable: z.ZodObject<{
    job: z.ZodObject<{
        id: z.ZodString;
        source: z.ZodString;
        cron: z.ZodString;
        lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        currentlyRunning: z.ZodBoolean;
        paused: z.ZodBoolean;
        currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zRunScheduleNowRequest_unstable: z.ZodObject<{
    scheduleId: z.ZodString;
}, z.core.$strip>;
export declare const zRunScheduleNowStatus: z.ZodEnum<{
    completed: "completed";
    cancelled: "cancelled";
}>;
export declare const zRunScheduleNowResponse_unstable: z.ZodObject<{
    status: z.ZodEnum<{
        completed: "completed";
        cancelled: "cancelled";
    }>;
    sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zKillRunningJobRequest_unstable: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export declare const zKillRunningJobResponse_unstable: z.ZodObject<{
    message: z.ZodString;
}, z.core.$strip>;
export declare const zInspectRunningJobRequest_unstable: z.ZodObject<{
    jobId: z.ZodString;
}, z.core.$strip>;
export declare const zInspectRunningJobResponse_unstable: z.ZodObject<{
    running: z.ZodBoolean;
    sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    runningDurationSeconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
/**
 * Return list-style metadata for a single session without loading the conversation.
 */
export declare const zGetSessionInfoRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
}, z.core.$strip>;
export declare const zGetSessionInfoResponse_unstable: z.ZodObject<{
    session: z.ZodObject<{
        sessionId: z.ZodString;
        cwd: z.ZodString;
        additionalDirectories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Truncate a session conversation from the given message timestamp onward.
 */
export declare const zTruncateSessionConversationRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    truncateFrom: z.ZodInt;
}, z.core.$strip>;
/**
 * Update the project association for a session.
 */
export declare const zUpdateSessionProjectRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * Rename a session.
 */
export declare const zRenameSessionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    title: z.ZodString;
}, z.core.$strip>;
/**
 * Archive a session (soft delete).
 */
export declare const zArchiveSessionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
}, z.core.$strip>;
/**
 * Unarchive a previously archived session.
 */
export declare const zUnarchiveSessionRequest_unstable: z.ZodObject<{
    sessionId: z.ZodString;
}, z.core.$strip>;
/**
 * The type of source entity.
 */
export declare const zSourceType: z.ZodEnum<{
    agent: "agent";
    skill: "skill";
    builtinSkill: "builtinSkill";
    recipe: "recipe";
    subrecipe: "subrecipe";
    project: "project";
}>;
/**
 * Target scope for creating or importing sources.
 */
export declare const zSourceScope: z.ZodUnion<readonly [z.ZodObject<{
    scope: z.ZodLiteral<"global">;
}, z.core.$strip>, z.ZodObject<{
    projectDir: z.ZodString;
    scope: z.ZodLiteral<"projectDir">;
}, z.core.$strip>, z.ZodObject<{
    projectId: z.ZodString;
    scope: z.ZodLiteral<"projectId">;
}, z.core.$strip>]>;
/**
 * Create a new source in an explicit target scope (global or project-scoped).
 */
export declare const zCreateSourceRequest_unstable: z.ZodObject<{
    type: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    name: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    target: z.ZodUnion<readonly [z.ZodObject<{
        scope: z.ZodLiteral<"global">;
    }, z.core.$strip>, z.ZodObject<{
        projectDir: z.ZodString;
        scope: z.ZodLiteral<"projectDir">;
    }, z.core.$strip>, z.ZodObject<{
        projectId: z.ZodString;
        scope: z.ZodLiteral<"projectId">;
    }, z.core.$strip>]>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
/**
 * A source discovered by Goose. Filesystem sources use an on-disk path;
 * built-in sources use a stable synthetic path. Sources may be either
 * `global` (shared across all projects) or project-specific.
 */
export declare const zSourceEntry: z.ZodObject<{
    type: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    name: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    path: z.ZodString;
    global: z.ZodBoolean;
    writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strip>;
export declare const zCreateSourceResponse_unstable: z.ZodObject<{
    source: z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        path: z.ZodString;
        global: z.ZodBoolean;
        writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * List discovered sources.
 *
 * If `type` is omitted or `skill`, this lists filesystem/plugin skills only.
 * Both global and project-scoped skills are included when `project_dir` is
 * set. If `type` is `builtinSkill`, this lists shipped read-only built-in
 * skills.
 */
export declare const zListSourcesRequest_unstable: z.ZodObject<{
    type: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>>>;
    projectDir: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    includeProjectSources: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const zListSourcesResponse_unstable: z.ZodObject<{
    sources: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        path: z.ZodString;
        global: z.ZodBoolean;
        writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List user-facing agent mention targets for `@` autocomplete.
 */
export declare const zListAgentMentionsRequest_unstable: z.ZodObject<{
    cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * A user-facing `@` mention target backed by an agent, recipe, or subrecipe source.
 */
export declare const zAgentMention: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    sourceType: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    sourcePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mention: z.ZodString;
}, z.core.$strip>;
export declare const zListAgentMentionsResponse_unstable: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        sourceType: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        sourcePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mention: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List slash commands available for `/` autocomplete.
 */
export declare const zListSlashCommandsRequest_unstable: z.ZodObject<{
    cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/**
 * All text that was typed after the command name is provided as input.
 */
export declare const zUnstructuredCommandInput: z.ZodObject<{
    hint: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * All text that was typed after the command name is provided as input.
 */
export declare const zAvailableCommandInput: z.ZodObject<{
    hint: z.ZodString;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
/**
 * Information about a command.
 */
export declare const zAvailableCommand: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    input: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        hint: z.ZodString;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>>;
    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const zListSlashCommandsResponse_unstable: z.ZodObject<{
    availableCommands: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        input: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            hint: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>>;
        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Update an existing source's name, description, and content by absolute path.
 */
export declare const zUpdateSourceRequest_unstable: z.ZodObject<{
    type: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    path: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    properties: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const zUpdateSourceResponse_unstable: z.ZodObject<{
    source: z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        path: z.ZodString;
        global: z.ZodBoolean;
        writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Delete a source and its on-disk directory by absolute path.
 */
export declare const zDeleteSourceRequest_unstable: z.ZodObject<{
    type: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    path: z.ZodString;
}, z.core.$strip>;
/**
 * Export a source at an absolute path as a portable JSON payload.
 */
export declare const zExportSourceRequest_unstable: z.ZodObject<{
    type: z.ZodEnum<{
        agent: "agent";
        skill: "skill";
        builtinSkill: "builtinSkill";
        recipe: "recipe";
        subrecipe: "subrecipe";
        project: "project";
    }>;
    path: z.ZodString;
}, z.core.$strip>;
export declare const zExportSourceResponse_unstable: z.ZodObject<{
    json: z.ZodString;
    filename: z.ZodString;
}, z.core.$strip>;
/**
 * Import a source from a JSON export payload produced by `_goose/unstable/sources/export`.
 * The imported source is written into the explicit target scope; on name
 * collisions a `-imported` suffix is appended.
 */
export declare const zImportSourcesRequest_unstable: z.ZodObject<{
    data: z.ZodString;
    target: z.ZodUnion<readonly [z.ZodObject<{
        scope: z.ZodLiteral<"global">;
    }, z.core.$strip>, z.ZodObject<{
        projectDir: z.ZodString;
        scope: z.ZodLiteral<"projectDir">;
    }, z.core.$strip>, z.ZodObject<{
        projectId: z.ZodString;
        scope: z.ZodLiteral<"projectId">;
    }, z.core.$strip>]>;
}, z.core.$strip>;
export declare const zImportSourcesResponse_unstable: z.ZodObject<{
    sources: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        path: z.ZodString;
        global: z.ZodBoolean;
        writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Transcribe audio via a dictation provider.
 */
export declare const zDictationTranscribeRequest_unstable: z.ZodObject<{
    audio: z.ZodString;
    mimeType: z.ZodString;
    provider: z.ZodString;
}, z.core.$strip>;
/**
 * Transcription result.
 */
export declare const zDictationTranscribeResponse_unstable: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>;
/**
 * Get the configuration status of all dictation providers.
 */
export declare const zDictationConfigRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zDictationModelOption: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodString;
}, z.core.$strip>;
/**
 * Per-provider configuration status.
 */
export declare const zDictationProviderStatusEntry: z.ZodObject<{
    configured: z.ZodBoolean;
    host: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodString;
    usesProviderConfig: z.ZodBoolean;
    settingsPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    modelConfigKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    defaultModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    selectedModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    availableModels: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
/**
 * Dictation config response — map of provider name to status.
 */
export declare const zDictationConfigResponse_unstable: z.ZodObject<{
    providers: z.ZodRecord<z.ZodString, z.ZodObject<{
        configured: z.ZodBoolean;
        host: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodString;
        usesProviderConfig: z.ZodBoolean;
        settingsPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        modelConfigKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        defaultModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        selectedModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        availableModels: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            description: z.ZodString;
        }, z.core.$strip>>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * List available local Whisper models with their download status.
 */
export declare const zDictationModelsListRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zDictationLocalModelStatus: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    description: z.ZodString;
    sizeMb: z.ZodInt;
    downloaded: z.ZodBoolean;
    downloadInProgress: z.ZodBoolean;
    recommended: z.ZodBoolean;
}, z.core.$strip>;
export declare const zDictationModelsListResponse_unstable: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        description: z.ZodString;
        sizeMb: z.ZodInt;
        downloaded: z.ZodBoolean;
        downloadInProgress: z.ZodBoolean;
        recommended: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Kick off a background download of a local Whisper model.
 */
export declare const zDictationModelDownloadRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
/**
 * Poll the progress of an in-flight download.
 */
export declare const zDictationModelDownloadProgressRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zDictationDownloadProgress: z.ZodObject<{
    bytesDownloaded: z.ZodInt;
    totalBytes: z.ZodInt;
    progressPercent: z.ZodNumber;
    status: z.ZodString;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zDictationModelDownloadProgressResponse_unstable: z.ZodObject<{
    progress: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        bytesDownloaded: z.ZodInt;
        totalBytes: z.ZodInt;
        progressPercent: z.ZodNumber;
        status: z.ZodString;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Cancel an in-flight download.
 */
export declare const zDictationModelCancelRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
/**
 * Delete a downloaded local Whisper model from disk.
 */
export declare const zDictationModelDeleteRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelsListRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zLocalInferenceDownloadState: z.ZodEnum<{
    NotDownloaded: "NotDownloaded";
    Downloading: "Downloading";
    Downloaded: "Downloaded";
}>;
export declare const zLocalInferenceModelDownloadStatusDto: z.ZodObject<{
    state: z.ZodEnum<{
        NotDownloaded: "NotDownloaded";
        Downloading: "Downloading";
        Downloaded: "Downloaded";
    }>;
    progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
export declare const zLocalInferenceSamplingConfig: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"Greedy">;
}, z.core.$strip>, z.ZodObject<{
    temperature: z.ZodNumber;
    topK: z.ZodInt;
    topP: z.ZodNumber;
    minP: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    type: z.ZodLiteral<"Temperature">;
}, z.core.$strip>, z.ZodObject<{
    tau: z.ZodNumber;
    eta: z.ZodNumber;
    seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    type: z.ZodLiteral<"MirostatV2">;
}, z.core.$strip>]>;
export declare const zLocalInferenceToolCallingMode: z.ZodEnum<{
    auto: "auto";
    force_native: "force_native";
    force_emulated: "force_emulated";
}>;
export declare const zLocalInferenceChatTemplate: z.ZodUnion<readonly [z.ZodObject<{
    type: z.ZodLiteral<"embedded">;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    type: z.ZodLiteral<"builtin">;
}, z.core.$strip>, z.ZodObject<{
    template: z.ZodString;
    type: z.ZodLiteral<"custom_inline">;
}, z.core.$strip>]>;
export declare const zLocalInferenceModelSettingsDto: z.ZodObject<{
    backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"Greedy">;
    }, z.core.$strip>, z.ZodObject<{
        temperature: z.ZodNumber;
        topK: z.ZodInt;
        topP: z.ZodNumber;
        minP: z.ZodNumber;
        seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        type: z.ZodLiteral<"Temperature">;
    }, z.core.$strip>, z.ZodObject<{
        tau: z.ZodNumber;
        eta: z.ZodNumber;
        seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        type: z.ZodLiteral<"MirostatV2">;
    }, z.core.$strip>]>>>;
    repeatPenalty: z.ZodNumber;
    repeatLastN: z.ZodInt;
    frequencyPenalty: z.ZodNumber;
    presencePenalty: z.ZodNumber;
    nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    useMlock: z.ZodBoolean;
    flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        auto: "auto";
        force_native: "force_native";
        force_emulated: "force_emulated";
    }>>>;
    chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        type: z.ZodLiteral<"embedded">;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        type: z.ZodLiteral<"builtin">;
    }, z.core.$strip>, z.ZodObject<{
        template: z.ZodString;
        type: z.ZodLiteral<"custom_inline">;
    }, z.core.$strip>]>>>;
    enableThinking: z.ZodBoolean;
    visionCapable: z.ZodBoolean;
    imageTokenEstimate: z.ZodInt;
    mmprojSizeBytes: z.ZodInt;
}, z.core.$strip>;
export declare const zLocalInferenceModelDto: z.ZodObject<{
    id: z.ZodString;
    repoId: z.ZodString;
    filename: z.ZodString;
    quantization: z.ZodString;
    sizeBytes: z.ZodInt;
    status: z.ZodObject<{
        state: z.ZodEnum<{
            NotDownloaded: "NotDownloaded";
            Downloading: "Downloading";
            Downloaded: "Downloaded";
        }>;
        progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>;
    recommended: z.ZodBoolean;
    isLoaded: z.ZodBoolean;
    settings: z.ZodObject<{
        backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"Greedy">;
        }, z.core.$strip>, z.ZodObject<{
            temperature: z.ZodNumber;
            topK: z.ZodInt;
            topP: z.ZodNumber;
            minP: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"Temperature">;
        }, z.core.$strip>, z.ZodObject<{
            tau: z.ZodNumber;
            eta: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"MirostatV2">;
        }, z.core.$strip>]>>>;
        repeatPenalty: z.ZodNumber;
        repeatLastN: z.ZodInt;
        frequencyPenalty: z.ZodNumber;
        presencePenalty: z.ZodNumber;
        nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        useMlock: z.ZodBoolean;
        flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            auto: "auto";
            force_native: "force_native";
            force_emulated: "force_emulated";
        }>>>;
        chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"embedded">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            template: z.ZodString;
            type: z.ZodLiteral<"custom_inline">;
        }, z.core.$strip>]>>>;
        enableThinking: z.ZodBoolean;
        visionCapable: z.ZodBoolean;
        imageTokenEstimate: z.ZodInt;
        mmprojSizeBytes: z.ZodInt;
    }, z.core.$strip>;
    visionCapable: z.ZodBoolean;
    mmprojStatus: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        state: z.ZodEnum<{
            NotDownloaded: "NotDownloaded";
            Downloading: "Downloading";
            Downloaded: "Downloaded";
        }>;
        progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const zLocalInferenceModelsListResponse_unstable: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        repoId: z.ZodString;
        filename: z.ZodString;
        quantization: z.ZodString;
        sizeBytes: z.ZodInt;
        status: z.ZodObject<{
            state: z.ZodEnum<{
                NotDownloaded: "NotDownloaded";
                Downloading: "Downloading";
                Downloaded: "Downloaded";
            }>;
            progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>;
        recommended: z.ZodBoolean;
        isLoaded: z.ZodBoolean;
        settings: z.ZodObject<{
            backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"Greedy">;
            }, z.core.$strip>, z.ZodObject<{
                temperature: z.ZodNumber;
                topK: z.ZodInt;
                topP: z.ZodNumber;
                minP: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"Temperature">;
            }, z.core.$strip>, z.ZodObject<{
                tau: z.ZodNumber;
                eta: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"MirostatV2">;
            }, z.core.$strip>]>>>;
            repeatPenalty: z.ZodNumber;
            repeatLastN: z.ZodInt;
            frequencyPenalty: z.ZodNumber;
            presencePenalty: z.ZodNumber;
            nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            useMlock: z.ZodBoolean;
            flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                auto: "auto";
                force_native: "force_native";
                force_emulated: "force_emulated";
            }>>>;
            chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"embedded">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                template: z.ZodString;
                type: z.ZodLiteral<"custom_inline">;
            }, z.core.$strip>]>>>;
            enableThinking: z.ZodBoolean;
            visionCapable: z.ZodBoolean;
            imageTokenEstimate: z.ZodInt;
            mmprojSizeBytes: z.ZodInt;
        }, z.core.$strip>;
        visionCapable: z.ZodBoolean;
        mmprojStatus: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            state: z.ZodEnum<{
                NotDownloaded: "NotDownloaded";
                Downloading: "Downloading";
                Downloaded: "Downloaded";
            }>;
            progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zLocalInferenceModelDownloadRequest_unstable: z.ZodObject<{
    spec: z.ZodString;
    backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    variantId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zLocalInferenceModelDownloadResponse_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelDownloadProgressRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceDownloadProgressDto: z.ZodObject<{
    modelId: z.ZodString;
    status: z.ZodString;
    bytesDownloaded: z.ZodInt;
    totalBytes: z.ZodInt;
    progressPercent: z.ZodNumber;
    speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    etaSeconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    taskExited: z.ZodBoolean;
}, z.core.$strip>;
export declare const zLocalInferenceModelDownloadProgressResponse_unstable: z.ZodObject<{
    progress: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        modelId: z.ZodString;
        status: z.ZodString;
        bytesDownloaded: z.ZodInt;
        totalBytes: z.ZodInt;
        progressPercent: z.ZodNumber;
        speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        etaSeconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        taskExited: z.ZodBoolean;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const zLocalInferenceModelDownloadCancelRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelDeleteRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelEvictRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelSettingsReadRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceModelSettingsReadResponse_unstable: z.ZodObject<{
    settings: z.ZodObject<{
        backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"Greedy">;
        }, z.core.$strip>, z.ZodObject<{
            temperature: z.ZodNumber;
            topK: z.ZodInt;
            topP: z.ZodNumber;
            minP: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"Temperature">;
        }, z.core.$strip>, z.ZodObject<{
            tau: z.ZodNumber;
            eta: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"MirostatV2">;
        }, z.core.$strip>]>>>;
        repeatPenalty: z.ZodNumber;
        repeatLastN: z.ZodInt;
        frequencyPenalty: z.ZodNumber;
        presencePenalty: z.ZodNumber;
        nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        useMlock: z.ZodBoolean;
        flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            auto: "auto";
            force_native: "force_native";
            force_emulated: "force_emulated";
        }>>>;
        chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"embedded">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            template: z.ZodString;
            type: z.ZodLiteral<"custom_inline">;
        }, z.core.$strip>]>>>;
        enableThinking: z.ZodBoolean;
        visionCapable: z.ZodBoolean;
        imageTokenEstimate: z.ZodInt;
        mmprojSizeBytes: z.ZodInt;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zLocalInferenceModelSettingsUpdateRequest_unstable: z.ZodObject<{
    modelId: z.ZodString;
    settings: z.ZodObject<{
        backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"Greedy">;
        }, z.core.$strip>, z.ZodObject<{
            temperature: z.ZodNumber;
            topK: z.ZodInt;
            topP: z.ZodNumber;
            minP: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"Temperature">;
        }, z.core.$strip>, z.ZodObject<{
            tau: z.ZodNumber;
            eta: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"MirostatV2">;
        }, z.core.$strip>]>>>;
        repeatPenalty: z.ZodNumber;
        repeatLastN: z.ZodInt;
        frequencyPenalty: z.ZodNumber;
        presencePenalty: z.ZodNumber;
        nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        useMlock: z.ZodBoolean;
        flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            auto: "auto";
            force_native: "force_native";
            force_emulated: "force_emulated";
        }>>>;
        chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"embedded">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            template: z.ZodString;
            type: z.ZodLiteral<"custom_inline">;
        }, z.core.$strip>]>>>;
        enableThinking: z.ZodBoolean;
        visionCapable: z.ZodBoolean;
        imageTokenEstimate: z.ZodInt;
        mmprojSizeBytes: z.ZodInt;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zLocalInferenceModelSettingsUpdateResponse_unstable: z.ZodObject<{
    settings: z.ZodObject<{
        backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"Greedy">;
        }, z.core.$strip>, z.ZodObject<{
            temperature: z.ZodNumber;
            topK: z.ZodInt;
            topP: z.ZodNumber;
            minP: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"Temperature">;
        }, z.core.$strip>, z.ZodObject<{
            tau: z.ZodNumber;
            eta: z.ZodNumber;
            seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            type: z.ZodLiteral<"MirostatV2">;
        }, z.core.$strip>]>>>;
        repeatPenalty: z.ZodNumber;
        repeatLastN: z.ZodInt;
        frequencyPenalty: z.ZodNumber;
        presencePenalty: z.ZodNumber;
        nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        useMlock: z.ZodBoolean;
        flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            auto: "auto";
            force_native: "force_native";
            force_emulated: "force_emulated";
        }>>>;
        chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            type: z.ZodLiteral<"embedded">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            template: z.ZodString;
            type: z.ZodLiteral<"custom_inline">;
        }, z.core.$strip>]>>>;
        enableThinking: z.ZodBoolean;
        visionCapable: z.ZodBoolean;
        imageTokenEstimate: z.ZodInt;
        mmprojSizeBytes: z.ZodInt;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const zLocalInferenceHuggingFaceSearchRequest_unstable: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
export declare const zLocalInferenceHfGgufFileDto: z.ZodObject<{
    filename: z.ZodString;
    sizeBytes: z.ZodInt;
    quantization: z.ZodString;
    downloadUrl: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceHfModelVariantDto: z.ZodObject<{
    variantId: z.ZodString;
    label: z.ZodString;
    backendId: z.ZodString;
    format: z.ZodString;
    modelId: z.ZodString;
    downloadId: z.ZodString;
    sizeBytes: z.ZodInt;
    filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodString;
    qualityRank: z.ZodInt;
    sharded: z.ZodBoolean;
    supported: z.ZodBoolean;
    unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zLocalInferenceHfModelInfoDto: z.ZodObject<{
    repoId: z.ZodString;
    author: z.ZodString;
    modelName: z.ZodString;
    downloads: z.ZodInt;
    ggufFiles: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        sizeBytes: z.ZodInt;
        quantization: z.ZodString;
        downloadUrl: z.ZodString;
    }, z.core.$strip>>>>;
    variants: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        label: z.ZodString;
        backendId: z.ZodString;
        format: z.ZodString;
        modelId: z.ZodString;
        downloadId: z.ZodString;
        sizeBytes: z.ZodInt;
        filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodString;
        qualityRank: z.ZodInt;
        sharded: z.ZodBoolean;
        supported: z.ZodBoolean;
        unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const zLocalInferenceHuggingFaceSearchResponse_unstable: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        repoId: z.ZodString;
        author: z.ZodString;
        modelName: z.ZodString;
        downloads: z.ZodInt;
        ggufFiles: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            filename: z.ZodString;
            sizeBytes: z.ZodInt;
            quantization: z.ZodString;
            downloadUrl: z.ZodString;
        }, z.core.$strip>>>>;
        variants: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            variantId: z.ZodString;
            label: z.ZodString;
            backendId: z.ZodString;
            format: z.ZodString;
            modelId: z.ZodString;
            downloadId: z.ZodString;
            sizeBytes: z.ZodInt;
            filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            description: z.ZodString;
            qualityRank: z.ZodInt;
            sharded: z.ZodBoolean;
            supported: z.ZodBoolean;
            unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const zLocalInferenceHuggingFaceRepoVariantsRequest_unstable: z.ZodObject<{
    repoId: z.ZodString;
}, z.core.$strip>;
export declare const zLocalInferenceHuggingFaceRepoVariantsResponse_unstable: z.ZodObject<{
    variants: z.ZodArray<z.ZodObject<{
        variantId: z.ZodString;
        label: z.ZodString;
        backendId: z.ZodString;
        format: z.ZodString;
        modelId: z.ZodString;
        downloadId: z.ZodString;
        sizeBytes: z.ZodInt;
        filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        description: z.ZodString;
        qualityRank: z.ZodInt;
        sharded: z.ZodBoolean;
        supported: z.ZodBoolean;
        unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    recommendedIndex: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    availableMemoryBytes: z.ZodInt;
    downloadedQuants: z.ZodArray<z.ZodString>;
    downloadedVariants: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const zLocalInferenceBuiltinChatTemplatesListRequest_unstable: z.ZodRecord<z.ZodString, z.ZodUnknown>;
export declare const zLocalInferenceBuiltinChatTemplatesListResponse_unstable: z.ZodObject<{
    templates: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
/**
 * Streaming context-window usage update for a session.
 */
export declare const zSessionUsageUpdate: z.ZodObject<{
    used: z.ZodInt;
    contextLimit: z.ZodInt;
    accumulatedInputTokens: z.ZodInt;
    accumulatedOutputTokens: z.ZodInt;
    accumulatedCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const zStatusMessage: z.ZodUnion<readonly [z.ZodObject<{
    message: z.ZodString;
    type: z.ZodLiteral<"notice">;
}, z.core.$strip>, z.ZodObject<{
    message: z.ZodString;
    type: z.ZodLiteral<"progress">;
}, z.core.$strip>]>;
/**
 * Live UI/session status. This is not conversation transcript content, and
 * should not be persisted or replayed as history.
 */
export declare const zStatusMessageUpdate: z.ZodObject<{
    status: z.ZodUnion<readonly [z.ZodObject<{
        message: z.ZodString;
        type: z.ZodLiteral<"notice">;
    }, z.core.$strip>, z.ZodObject<{
        message: z.ZodString;
        type: z.ZodLiteral<"progress">;
    }, z.core.$strip>]>;
}, z.core.$strip>;
/**
 * Wire mirror of the conversation `CostSource`.
 */
export declare const zCostSourceData: z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>;
/**
 * Wire mirror of the conversation `MessageUsage` (this crate cannot depend on
 * goose-provider-types); field names and serde casing MUST stay in parity.
 */
export declare const zMessageUsageData: z.ZodObject<{
    inputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    outputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    totalTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    cacheReadTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    cacheWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    costSource: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>>>;
    elapsedMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    timeToFirstTokenMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    isCompaction: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
/**
 * Per-message token usage/cost/timing, keyed by the message id used for
 * chunk matching. Sent live after a turn's messages and on replay.
 */
export declare const zMessageUsageUpdate: z.ZodObject<{
    messageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    usage: z.ZodObject<{
        inputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        outputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        totalTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cacheReadTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cacheWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        costSource: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>>>;
        elapsedMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        timeToFirstTokenMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        isCompaction: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Discriminated union of goose-specific session update payloads.
 * Variant tag matches ACP's convention (`sessionUpdate: "<snake_case>"`).
 *
 * `discriminator.mapping` is what makes TS codegen (`@hey-api/openapi-ts`)
 * emit the correct snake_case tag value even when this enum has a single
 * variant. Add a mapping entry per variant.
 */
export declare const zGooseSessionUpdate: z.ZodDiscriminatedUnion<[z.ZodObject<{
    used: z.ZodInt;
    contextLimit: z.ZodInt;
    accumulatedInputTokens: z.ZodInt;
    accumulatedOutputTokens: z.ZodInt;
    accumulatedCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    sessionUpdate: z.ZodLiteral<"usage_update">;
}, z.core.$strip>, z.ZodObject<{
    status: z.ZodUnion<readonly [z.ZodObject<{
        message: z.ZodString;
        type: z.ZodLiteral<"notice">;
    }, z.core.$strip>, z.ZodObject<{
        message: z.ZodString;
        type: z.ZodLiteral<"progress">;
    }, z.core.$strip>]>;
    sessionUpdate: z.ZodLiteral<"status_message">;
}, z.core.$strip>, z.ZodObject<{
    messageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    usage: z.ZodObject<{
        inputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        outputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        totalTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cacheReadTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cacheWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        costSource: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>>>;
        elapsedMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        timeToFirstTokenMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        isCompaction: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>;
    sessionUpdate: z.ZodLiteral<"message_usage">;
}, z.core.$strip>], "sessionUpdate">;
/**
 * Goose-custom session update notification — a parallel to ACP's
 * `session/update` carrying goose-specific update variants.
 */
export declare const zGooseSessionNotification_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    update: z.ZodDiscriminatedUnion<[z.ZodObject<{
        used: z.ZodInt;
        contextLimit: z.ZodInt;
        accumulatedInputTokens: z.ZodInt;
        accumulatedOutputTokens: z.ZodInt;
        accumulatedCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        sessionUpdate: z.ZodLiteral<"usage_update">;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodUnion<readonly [z.ZodObject<{
            message: z.ZodString;
            type: z.ZodLiteral<"notice">;
        }, z.core.$strip>, z.ZodObject<{
            message: z.ZodString;
            type: z.ZodLiteral<"progress">;
        }, z.core.$strip>]>;
        sessionUpdate: z.ZodLiteral<"status_message">;
    }, z.core.$strip>, z.ZodObject<{
        messageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        usage: z.ZodObject<{
            inputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            outputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            totalTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cacheReadTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cacheWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            costSource: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>>>;
            elapsedMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            timeToFirstTokenMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            isCompaction: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>;
        sessionUpdate: z.ZodLiteral<"message_usage">;
    }, z.core.$strip>], "sessionUpdate">;
}, z.core.$strip>;
/**
 * Dedicated provider notification for OAuth device-code flow.
 * Sent during provider authentication when the ACP client supports
 * `goose.customNotifications` — avoids a fake empty session ID.
 */
export declare const zProviderDeviceCodeNotification_unstable: z.ZodObject<{
    providerId: z.ZodString;
    userCode: z.ZodString;
    verificationUri: z.ZodString;
    expiresIn: z.ZodInt;
}, z.core.$strip>;
export declare const zRequestRecipeParams_unstable: z.ZodObject<{
    sessionId: z.ZodString;
    parameters: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        input_type: z.ZodEnum<{
            string: "string";
            number: "number";
            boolean: "boolean";
            date: "date";
            file: "file";
            select: "select";
        }>;
        requirement: z.ZodEnum<{
            optional: "optional";
            required: "required";
            user_prompt: "user_prompt";
        }>;
        description: z.ZodString;
        default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>>;
    parameterScopeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const zRecipeParamsAction: z.ZodEnum<{
    submit: "submit";
    cancel: "cancel";
}>;
export declare const zRecipeParamsResponse_unstable: z.ZodObject<{
    action: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        submit: "submit";
        cancel: "cancel";
    }>>>;
    values: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, z.core.$strip>;
export declare const zExtRequest: z.ZodObject<{
    id: z.ZodString;
    method: z.ZodString;
    params: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodObject<{
        sessionId: z.ZodString;
        extension: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            server: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"http">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"sse">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                command: z.ZodString;
                args: z.ZodArray<z.ZodString>;
                env: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>]>;
            envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"mcp">;
        }, z.core.$strip>]>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        extensionKey: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        extensionName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        toolPermissions: z.ZodArray<z.ZodObject<{
            toolName: z.ZodString;
            permission: z.ZodEnum<{
                always_allow: "always_allow";
                ask_before: "ask_before";
                never_allow: "never_allow";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        name: z.ZodString;
        arguments: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        uri: z.ZodString;
        extensionName: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        html: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        workingDir: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        mode: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"set">, z.ZodLiteral<"append">]>>>;
        key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        prompt: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
                lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            text: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"TextContent">;
        }, z.core.$strip>, z.ZodObject<{
            annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
                lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            uri: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"ImageContent">;
        }, z.core.$strip>, z.ZodObject<{
            annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
                lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            data: z.ZodString;
            mimeType: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"AudioContent">;
        }, z.core.$strip>, z.ZodObject<{
            annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
                lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
            size: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            uri: z.ZodString;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"ResourceLink">;
        }, z.core.$strip>, z.ZodObject<{
            annotations: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                audience: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodLiteral<"assistant">, z.ZodLiteral<"user">]>>>>;
                lastModified: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                priority: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            resource: z.ZodUnion<readonly [z.ZodObject<{
                mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                text: z.ZodString;
                uri: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>, z.ZodObject<{
                blob: z.ZodString;
                mimeType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>]>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            type: z.ZodLiteral<"EmbeddedResource">;
        }, z.core.$strip>], "type">>>>;
        expectedRunId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        level: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            summary: "summary";
            full: "full";
        }>>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        extension: z.ZodUnion<readonly [z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"builtin">;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"platform">;
        }, z.core.$strip>, z.ZodObject<{
            server: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"http">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
                headers: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                type: z.ZodLiteral<"sse">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                command: z.ZodString;
                args: z.ZodArray<z.ZodString>;
                env: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    value: z.ZodString;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>>;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>]>;
            envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
            bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            type: z.ZodLiteral<"mcp">;
        }, z.core.$strip>]>;
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        configKey: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        configKey: z.ZodString;
        enabled: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        format: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        engine: z.ZodString;
        displayName: z.ZodString;
        apiUrl: z.ZodString;
        apiKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
        requiresAuth: z.ZodBoolean;
        catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        preservesThinking: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        engine: z.ZodString;
        displayName: z.ZodString;
        apiUrl: z.ZodString;
        apiKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
        requiresAuth: z.ZodBoolean;
        catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        preservesThinking: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        provider: z.ZodString;
        model: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        keys: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
            autoCompactThreshold: "autoCompactThreshold";
            gooseThinkingEffort: "gooseThinkingEffort";
            voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
            voiceDictationProvider: "voiceDictationProvider";
            voiceDictationPreferredMic: "voiceDictationPreferredMic";
        }>>>>;
    }, z.core.$strip>, z.ZodObject<{
        values: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodEnum<{
                autoCompactThreshold: "autoCompactThreshold";
                gooseThinkingEffort: "gooseThinkingEffort";
                voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
                voiceDictationProvider: "voiceDictationProvider";
                voiceDictationPreferredMic: "voiceDictationPreferredMic";
            }>;
            value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>, z.ZodObject<{
        key: z.ZodString;
        isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnknown;
        isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        key: z.ZodString;
        isSecret: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        providerId: z.ZodString;
        modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        sources: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<{
            goose_config: "goose_config";
            claude_desktop: "claude_desktop";
        }>>>>;
    }, z.core.$strip>, z.ZodObject<{
        candidateIds: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        enableImportedExtensions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        format: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            json: "json";
            markdown: "markdown";
        }>>>;
    }, z.core.$strip>, z.ZodObject<{
        input: z.ZodString;
        source: z.ZodEnum<{
            json: "json";
            auto: "auto";
            nostr: "nostr";
        }>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        cwd: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        relays: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        deeplink: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        cron_schedule: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        slash_command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        content: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        scheduleId: z.ZodString;
        limit: z.ZodInt;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        cron: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        scheduleId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        scheduleId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        scheduleId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        scheduleId: z.ZodString;
        cron: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        scheduleId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        jobId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        truncateFrom: z.ZodInt;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        title: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        target: z.ZodUnion<readonly [z.ZodObject<{
            scope: z.ZodLiteral<"global">;
        }, z.core.$strip>, z.ZodObject<{
            projectDir: z.ZodString;
            scope: z.ZodLiteral<"projectDir">;
        }, z.core.$strip>, z.ZodObject<{
            projectId: z.ZodString;
            scope: z.ZodLiteral<"projectId">;
        }, z.core.$strip>]>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>>>;
        projectDir: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        includeProjectSources: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>, z.ZodObject<{
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        path: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        content: z.ZodString;
        properties: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        path: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        type: z.ZodEnum<{
            agent: "agent";
            skill: "skill";
            builtinSkill: "builtinSkill";
            recipe: "recipe";
            subrecipe: "subrecipe";
            project: "project";
        }>;
        path: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        data: z.ZodString;
        target: z.ZodUnion<readonly [z.ZodObject<{
            scope: z.ZodLiteral<"global">;
        }, z.core.$strip>, z.ZodObject<{
            projectDir: z.ZodString;
            scope: z.ZodLiteral<"projectDir">;
        }, z.core.$strip>, z.ZodObject<{
            projectId: z.ZodString;
            scope: z.ZodLiteral<"projectId">;
        }, z.core.$strip>]>;
    }, z.core.$strip>, z.ZodObject<{
        audio: z.ZodString;
        mimeType: z.ZodString;
        provider: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        spec: z.ZodString;
        backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        variantId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
        settings: z.ZodObject<{
            backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"Greedy">;
            }, z.core.$strip>, z.ZodObject<{
                temperature: z.ZodNumber;
                topK: z.ZodInt;
                topP: z.ZodNumber;
                minP: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"Temperature">;
            }, z.core.$strip>, z.ZodObject<{
                tau: z.ZodNumber;
                eta: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"MirostatV2">;
            }, z.core.$strip>]>>>;
            repeatPenalty: z.ZodNumber;
            repeatLastN: z.ZodInt;
            frequencyPenalty: z.ZodNumber;
            presencePenalty: z.ZodNumber;
            nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            useMlock: z.ZodBoolean;
            flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                auto: "auto";
                force_native: "force_native";
                force_emulated: "force_emulated";
            }>>>;
            chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"embedded">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                template: z.ZodString;
                type: z.ZodLiteral<"custom_inline">;
            }, z.core.$strip>]>>>;
            enableThinking: z.ZodBoolean;
            visionCapable: z.ZodBoolean;
            imageTokenEstimate: z.ZodInt;
            mmprojSizeBytes: z.ZodInt;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        query: z.ZodString;
        limit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>, z.ZodObject<{
        repoId: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>>;
}, z.core.$strip>;
export declare const zExtResponse: z.ZodUnion<readonly [z.ZodObject<{
    id: z.ZodString;
    result: z.ZodOptional<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        tools: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            parameters: z.ZodArray<z.ZodString>;
            permission: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                always_allow: "always_allow";
                ask_before: "ask_before";
                never_allow: "never_allow";
            }>>>;
            inputSchema: z.ZodUnknown;
            outputSchema: z.ZodOptional<z.ZodUnknown>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>, z.ZodObject<{
        content: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnknown>>>;
        structuredContent: z.ZodOptional<z.ZodUnknown>;
        isError: z.ZodBoolean;
        _meta: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        result: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
    }, z.core.$strip>, z.ZodObject<{
        apps: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodUnknown>>>;
    }, z.core.$strip>, z.ZodObject<{
        html: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        message: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        runId: z.ZodString;
        messageId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        report: z.ZodUnknown;
    }, z.core.$strip>, z.ZodObject<{
        prompts: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            defaultContent: z.ZodString;
            userContent: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            isCustomized: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        content: z.ZodString;
        defaultContent: z.ZodString;
        isCustomized: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        extensions: z.ZodArray<z.ZodObject<{
            extension: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                server: z.ZodUnion<readonly [z.ZodObject<{
                    name: z.ZodString;
                    url: z.ZodString;
                    headers: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    type: z.ZodLiteral<"http">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    url: z.ZodString;
                    headers: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    type: z.ZodLiteral<"sse">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    command: z.ZodString;
                    args: z.ZodArray<z.ZodString>;
                    env: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>]>;
                envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"mcp">;
            }, z.core.$strip>]>;
            enabled: z.ZodBoolean;
            configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    }, z.core.$strip>, z.ZodObject<{
        extensions: z.ZodArray<z.ZodObject<{
            extension: z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                server: z.ZodUnion<readonly [z.ZodObject<{
                    name: z.ZodString;
                    url: z.ZodString;
                    headers: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    type: z.ZodLiteral<"http">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    url: z.ZodString;
                    headers: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    type: z.ZodLiteral<"sse">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    command: z.ZodString;
                    args: z.ZodArray<z.ZodString>;
                    env: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        value: z.ZodString;
                        _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                    }, z.core.$strip>>;
                    _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
                }, z.core.$strip>]>;
                envKeys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                clientId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                clientSecretKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"mcp">;
            }, z.core.$strip>]>;
            extensionKey: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        entries: z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            providerName: z.ZodString;
            description: z.ZodString;
            defaultModel: z.ZodString;
            configured: z.ZodBoolean;
            available: z.ZodBoolean;
            providerType: z.ZodString;
            category: z.ZodEnum<{
                agent: "agent";
                model: "model";
            }>;
            acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            visibleInSetup: z.ZodBoolean;
            deprecated: z.ZodBoolean;
            replacement: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            configKeys: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                required: z.ZodBoolean;
                secret: z.ZodBoolean;
                default: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                oauthFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                deviceCodeFlow: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                primary: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>>;
            setupSteps: z.ZodArray<z.ZodString>;
            supportsRefresh: z.ZodBoolean;
            refreshing: z.ZodBoolean;
            models: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                family: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                contextLimit: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                reasoning: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                recommended: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>>;
            lastUpdatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastRefreshAttemptAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            lastRefreshError: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            stale: z.ZodBoolean;
            modelSelectionHint: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        models: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        providers: z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            name: z.ZodString;
            format: z.ZodString;
            apiUrl: z.ZodString;
            modelCount: z.ZodInt;
            docUrl: z.ZodString;
            envVar: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        providers: z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            name: z.ZodString;
            category: z.ZodEnum<{
                agent: "agent";
                model: "model";
            }>;
            acp: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            description: z.ZodString;
            setupMethod: z.ZodEnum<{
                none: "none";
                single_api_key: "single_api_key";
                config_fields: "config_fields";
                host_with_oauth_fallback: "host_with_oauth_fallback";
                oauth_browser: "oauth_browser";
                oauth_device_code: "oauth_device_code";
                cloud_credentials: "cloud_credentials";
                local: "local";
                cli_auth: "cli_auth";
            }>;
            nativeConnectQuery: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            fields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                label: z.ZodString;
                secret: z.ZodBoolean;
                required: z.ZodBoolean;
                placeholder: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                defaultValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            binaryName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            docUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            group: z.ZodEnum<{
                default: "default";
                additional: "additional";
            }>;
            showOnlyWhenInstalled: z.ZodBoolean;
            aliases: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            supportsInstall: z.ZodBoolean;
            supportsAuth: z.ZodBoolean;
            supportsAuthStatus: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        template: z.ZodObject<{
            providerId: z.ZodString;
            name: z.ZodString;
            format: z.ZodString;
            apiUrl: z.ZodString;
            models: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                contextLimit: z.ZodInt;
                capabilities: z.ZodObject<{
                    toolCall: z.ZodBoolean;
                    reasoning: z.ZodBoolean;
                    attachment: z.ZodBoolean;
                    temperature: z.ZodBoolean;
                }, z.core.$strip>;
                deprecated: z.ZodBoolean;
            }, z.core.$strip>>;
            supportsStreaming: z.ZodBoolean;
            envVar: z.ZodString;
            docUrl: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        status: z.ZodObject<{
            providerId: z.ZodString;
            isConfigured: z.ZodBoolean;
        }, z.core.$strip>;
        refresh: z.ZodObject<{
            started: z.ZodArray<z.ZodString>;
            skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerId: z.ZodString;
                reason: z.ZodEnum<{
                    unknown_provider: "unknown_provider";
                    not_configured: "not_configured";
                    does_not_support_refresh: "does_not_support_refresh";
                    already_refreshing: "already_refreshing";
                }>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        provider: z.ZodObject<{
            providerId: z.ZodString;
            engine: z.ZodString;
            displayName: z.ZodString;
            apiUrl: z.ZodString;
            models: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
            supportsStreaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            headers: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
            requiresAuth: z.ZodBoolean;
            catalogProviderId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            basePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            apiKeyEnv: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            apiKeySet: z.ZodBoolean;
            preservesThinking: z.ZodBoolean;
        }, z.core.$strip>;
        editable: z.ZodBoolean;
        status: z.ZodObject<{
            providerId: z.ZodString;
            isConfigured: z.ZodBoolean;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        status: z.ZodObject<{
            providerId: z.ZodString;
            isConfigured: z.ZodBoolean;
        }, z.core.$strip>;
        refresh: z.ZodObject<{
            started: z.ZodArray<z.ZodString>;
            skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerId: z.ZodString;
                reason: z.ZodEnum<{
                    unknown_provider: "unknown_provider";
                    not_configured: "not_configured";
                    does_not_support_refresh: "does_not_support_refresh";
                    already_refreshing: "already_refreshing";
                }>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        refresh: z.ZodObject<{
            started: z.ZodArray<z.ZodString>;
            skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerId: z.ZodString;
                reason: z.ZodEnum<{
                    unknown_provider: "unknown_provider";
                    not_configured: "not_configured";
                    does_not_support_refresh: "does_not_support_refresh";
                    already_refreshing: "already_refreshing";
                }>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        started: z.ZodArray<z.ZodString>;
        skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            reason: z.ZodEnum<{
                unknown_provider: "unknown_provider";
                not_configured: "not_configured";
                does_not_support_refresh: "does_not_support_refresh";
                already_refreshing: "already_refreshing";
            }>;
        }, z.core.$strip>>>>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        ready: z.ZodBoolean;
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        fields: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodDefault<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            isSet: z.ZodBoolean;
            isSecret: z.ZodBoolean;
            required: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        statuses: z.ZodArray<z.ZodObject<{
            providerId: z.ZodString;
            isConfigured: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodObject<{
            providerId: z.ZodString;
            isConfigured: z.ZodBoolean;
        }, z.core.$strip>;
        refresh: z.ZodObject<{
            started: z.ZodArray<z.ZodString>;
            skipped: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                providerId: z.ZodString;
                reason: z.ZodEnum<{
                    unknown_provider: "unknown_provider";
                    not_configured: "not_configured";
                    does_not_support_refresh: "does_not_support_refresh";
                    already_refreshing: "already_refreshing";
                }>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        secrets: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            provider: z.ZodString;
            providerDisplayName: z.ZodString;
            name: z.ZodString;
            storage: z.ZodEnum<{
                secret_store: "secret_store";
                provider_cache: "provider_cache";
            }>;
            expiresAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            status: z.ZodEnum<{
                valid: "valid";
                expired: "expired";
                unknown: "unknown";
            }>;
            configured: z.ZodBoolean;
            hasSecret: z.ZodBoolean;
            canDelete: z.ZodBoolean;
            canConfigure: z.ZodBoolean;
            configureProvider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        modelInfo: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            provider: z.ZodString;
            model: z.ZodString;
            contextLimit: z.ZodInt;
            maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            reasoning: z.ZodBoolean;
            inputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            outputTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            cacheReadTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            cacheWriteTokenCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            currency: z.ZodString;
        }, z.core.$strip>>>;
    }, z.core.$strip>, z.ZodObject<{
        values: z.ZodArray<z.ZodObject<{
            key: z.ZodEnum<{
                autoCompactThreshold: "autoCompactThreshold";
                gooseThinkingEffort: "gooseThinkingEffort";
                voiceAutoSubmitPhrases: "voiceAutoSubmitPhrases";
                voiceDictationProvider: "voiceDictationProvider";
                voiceDictationPreferredMic: "voiceDictationPreferredMic";
            }>;
            value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        value: z.ZodDefault<z.ZodOptional<z.ZodUnknown>>;
    }, z.core.$strip>, z.ZodObject<{
        config: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        candidates: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            sourceKind: z.ZodEnum<{
                goose_config: "goose_config";
                claude_desktop: "claude_desktop";
            }>;
            displayName: z.ZodString;
            path: z.ZodString;
            counts: z.ZodObject<{
                providers: z.ZodInt;
                extensions: z.ZodInt;
                sessions: z.ZodInt;
                skills: z.ZodInt;
                projects: z.ZodInt;
                preferences: z.ZodInt;
            }, z.core.$strip>;
            warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        imported: z.ZodObject<{
            providers: z.ZodInt;
            extensions: z.ZodInt;
            sessions: z.ZodInt;
            skills: z.ZodInt;
            projects: z.ZodInt;
            preferences: z.ZodInt;
        }, z.core.$strip>;
        skipped: z.ZodObject<{
            providers: z.ZodInt;
            extensions: z.ZodInt;
            sessions: z.ZodInt;
            skills: z.ZodInt;
            projects: z.ZodInt;
            preferences: z.ZodInt;
        }, z.core.$strip>;
        warnings: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        providerDefaults: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            providerId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            modelId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>, z.ZodObject<{
        data: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sessionId: z.ZodString;
        title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        messageCount: z.ZodInt;
    }, z.core.$strip>, z.ZodObject<{
        sessions: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            cwd: z.ZodString;
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        deeplink: z.ZodString;
        nevent: z.ZodString;
        eventId: z.ZodString;
        relays: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        deeplink: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        has_security_warnings: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        recipes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            recipe: z.ZodObject<{
                version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
                title: z.ZodString;
                description: z.ZodString;
                instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                    type: z.ZodLiteral<"builtin">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                    type: z.ZodLiteral<"platform">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    cmd: z.ZodString;
                    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                    env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                    type: z.ZodLiteral<"stdio">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    uri: z.ZodString;
                    envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                    env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                    timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                    bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                    type: z.ZodLiteral<"streamable_http">;
                }, z.core.$strip>]>>>>;
                settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                }, z.core.$strip>>>;
                activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>>;
                parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    input_type: z.ZodEnum<{
                        string: "string";
                        number: "number";
                        boolean: "boolean";
                        date: "date";
                        file: "file";
                        select: "select";
                    }>;
                    requirement: z.ZodEnum<{
                        optional: "optional";
                        required: "required";
                        user_prompt: "user_prompt";
                    }>;
                    description: z.ZodString;
                    default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                }, z.core.$strip>>>>;
                response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    json_schema: z.ZodOptional<z.ZodUnknown>;
                }, z.core.$strip>>>;
                sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    path: z.ZodString;
                    values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                    sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>>>;
                retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    max_retries: z.ZodInt;
                    checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                        command: z.ZodString;
                        type: z.ZodLiteral<"shell">;
                    }, z.core.$strip>>>>;
                    on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                    timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                }, z.core.$strip>>>;
            }, z.core.$strip>;
            file_path: z.ZodString;
            last_modified: z.ZodString;
            schedule_cron: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            slash_command: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
        file_name: z.ZodString;
        file_path: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        recipe: z.ZodObject<{
            version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            title: z.ZodString;
            description: z.ZodString;
            instructions: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            prompt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            extensions: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                display_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"platform">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                cmd: z.ZodString;
                args: z.ZodOptional<z.ZodArray<z.ZodString>>;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cwd: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"stdio">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                uri: z.ZodString;
                envs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                env_keys: z.ZodOptional<z.ZodArray<z.ZodString>>;
                headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                socket: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                client_secret_key: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                scopes: z.ZodOptional<z.ZodArray<z.ZodString>>;
                bundled: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                available_tools: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
                type: z.ZodLiteral<"streamable_http">;
            }, z.core.$strip>]>>>>;
            settings: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                goose_provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                goose_model: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                temperature: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                max_turns: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
            activities: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                contact: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                metadata: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
            parameters: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                input_type: z.ZodEnum<{
                    string: "string";
                    number: "number";
                    boolean: "boolean";
                    date: "date";
                    file: "file";
                    select: "select";
                }>;
                requirement: z.ZodEnum<{
                    optional: "optional";
                    required: "required";
                    user_prompt: "user_prompt";
                }>;
                description: z.ZodString;
                default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
            }, z.core.$strip>>>>;
            response: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                json_schema: z.ZodOptional<z.ZodUnknown>;
            }, z.core.$strip>>>;
            sub_recipes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                path: z.ZodString;
                values: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodString>>>;
                sequential_when_repeated: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
                description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
            retry: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                max_retries: z.ZodInt;
                checks: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                    command: z.ZodString;
                    type: z.ZodLiteral<"shell">;
                }, z.core.$strip>>>>;
                on_failure: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                on_failure_timeout_seconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        yaml: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        jobs: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
            cron: z.ZodString;
            lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            currentlyRunning: z.ZodBoolean;
            paused: z.ZodBoolean;
            currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        sessions: z.ZodArray<z.ZodObject<{
            sessionId: z.ZodString;
            cwd: z.ZodString;
            additionalDirectories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        job: z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
            cron: z.ZodString;
            lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            currentlyRunning: z.ZodBoolean;
            paused: z.ZodBoolean;
            currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        job: z.ZodObject<{
            id: z.ZodString;
            source: z.ZodString;
            cron: z.ZodString;
            lastRun: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            currentlyRunning: z.ZodBoolean;
            paused: z.ZodBoolean;
            currentSessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodEnum<{
            completed: "completed";
            cancelled: "cancelled";
        }>;
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodObject<{
        message: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        running: z.ZodBoolean;
        sessionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        jobStartTime: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        runningDurationSeconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
    }, z.core.$strip>, z.ZodObject<{
        session: z.ZodObject<{
            sessionId: z.ZodString;
            cwd: z.ZodString;
            additionalDirectories: z.ZodOptional<z.ZodArray<z.ZodString>>;
            title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodObject<{
            type: z.ZodEnum<{
                agent: "agent";
                skill: "skill";
                builtinSkill: "builtinSkill";
                recipe: "recipe";
                subrecipe: "subrecipe";
                project: "project";
            }>;
            name: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            path: z.ZodString;
            global: z.ZodBoolean;
            writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        sources: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                agent: "agent";
                skill: "skill";
                builtinSkill: "builtinSkill";
                recipe: "recipe";
                subrecipe: "subrecipe";
                project: "project";
            }>;
            name: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            path: z.ZodString;
            global: z.ZodBoolean;
            writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            sourceType: z.ZodEnum<{
                agent: "agent";
                skill: "skill";
                builtinSkill: "builtinSkill";
                recipe: "recipe";
                subrecipe: "subrecipe";
                project: "project";
            }>;
            sourcePath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mention: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        availableCommands: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodString;
            input: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                hint: z.ZodString;
                _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
            }, z.core.$strip>>>;
            _meta: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodObject<{
            type: z.ZodEnum<{
                agent: "agent";
                skill: "skill";
                builtinSkill: "builtinSkill";
                recipe: "recipe";
                subrecipe: "subrecipe";
                project: "project";
            }>;
            name: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            path: z.ZodString;
            global: z.ZodBoolean;
            writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        json: z.ZodString;
        filename: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        sources: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                agent: "agent";
                skill: "skill";
                builtinSkill: "builtinSkill";
                recipe: "recipe";
                subrecipe: "subrecipe";
                project: "project";
            }>;
            name: z.ZodString;
            description: z.ZodString;
            content: z.ZodString;
            path: z.ZodString;
            global: z.ZodBoolean;
            writable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            supportingFiles: z.ZodOptional<z.ZodArray<z.ZodString>>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        text: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        providers: z.ZodRecord<z.ZodString, z.ZodObject<{
            configured: z.ZodBoolean;
            host: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            description: z.ZodString;
            usesProviderConfig: z.ZodBoolean;
            settingsPath: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            configKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            modelConfigKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            defaultModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            selectedModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            availableModels: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
                description: z.ZodString;
            }, z.core.$strip>>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            description: z.ZodString;
            sizeMb: z.ZodInt;
            downloaded: z.ZodBoolean;
            downloadInProgress: z.ZodBoolean;
            recommended: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        progress: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            bytesDownloaded: z.ZodInt;
            totalBytes: z.ZodInt;
            progressPercent: z.ZodNumber;
            status: z.ZodString;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>, z.ZodObject<{
        models: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            repoId: z.ZodString;
            filename: z.ZodString;
            quantization: z.ZodString;
            sizeBytes: z.ZodInt;
            status: z.ZodObject<{
                state: z.ZodEnum<{
                    NotDownloaded: "NotDownloaded";
                    Downloading: "Downloading";
                    Downloaded: "Downloaded";
                }>;
                progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>;
            recommended: z.ZodBoolean;
            isLoaded: z.ZodBoolean;
            settings: z.ZodObject<{
                backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"Greedy">;
                }, z.core.$strip>, z.ZodObject<{
                    temperature: z.ZodNumber;
                    topK: z.ZodInt;
                    topP: z.ZodNumber;
                    minP: z.ZodNumber;
                    seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    type: z.ZodLiteral<"Temperature">;
                }, z.core.$strip>, z.ZodObject<{
                    tau: z.ZodNumber;
                    eta: z.ZodNumber;
                    seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                    type: z.ZodLiteral<"MirostatV2">;
                }, z.core.$strip>]>>>;
                repeatPenalty: z.ZodNumber;
                repeatLastN: z.ZodInt;
                frequencyPenalty: z.ZodNumber;
                presencePenalty: z.ZodNumber;
                nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                useMlock: z.ZodBoolean;
                flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                    auto: "auto";
                    force_native: "force_native";
                    force_emulated: "force_emulated";
                }>>>;
                chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                    type: z.ZodLiteral<"embedded">;
                }, z.core.$strip>, z.ZodObject<{
                    name: z.ZodString;
                    type: z.ZodLiteral<"builtin">;
                }, z.core.$strip>, z.ZodObject<{
                    template: z.ZodString;
                    type: z.ZodLiteral<"custom_inline">;
                }, z.core.$strip>]>>>;
                enableThinking: z.ZodBoolean;
                visionCapable: z.ZodBoolean;
                imageTokenEstimate: z.ZodInt;
                mmprojSizeBytes: z.ZodInt;
            }, z.core.$strip>;
            visionCapable: z.ZodBoolean;
            mmprojStatus: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                state: z.ZodEnum<{
                    NotDownloaded: "NotDownloaded";
                    Downloading: "Downloading";
                    Downloaded: "Downloaded";
                }>;
                progressPercent: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                bytesDownloaded: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                totalBytes: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        modelId: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        progress: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            modelId: z.ZodString;
            status: z.ZodString;
            bytesDownloaded: z.ZodInt;
            totalBytes: z.ZodInt;
            progressPercent: z.ZodNumber;
            speedBps: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            etaSeconds: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            taskExited: z.ZodBoolean;
        }, z.core.$strip>>>;
    }, z.core.$strip>, z.ZodObject<{
        settings: z.ZodObject<{
            backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"Greedy">;
            }, z.core.$strip>, z.ZodObject<{
                temperature: z.ZodNumber;
                topK: z.ZodInt;
                topP: z.ZodNumber;
                minP: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"Temperature">;
            }, z.core.$strip>, z.ZodObject<{
                tau: z.ZodNumber;
                eta: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"MirostatV2">;
            }, z.core.$strip>]>>>;
            repeatPenalty: z.ZodNumber;
            repeatLastN: z.ZodInt;
            frequencyPenalty: z.ZodNumber;
            presencePenalty: z.ZodNumber;
            nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            useMlock: z.ZodBoolean;
            flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                auto: "auto";
                force_native: "force_native";
                force_emulated: "force_emulated";
            }>>>;
            chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"embedded">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                template: z.ZodString;
                type: z.ZodLiteral<"custom_inline">;
            }, z.core.$strip>]>>>;
            enableThinking: z.ZodBoolean;
            visionCapable: z.ZodBoolean;
            imageTokenEstimate: z.ZodInt;
            mmprojSizeBytes: z.ZodInt;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        settings: z.ZodObject<{
            backendId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            contextSize: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            maxOutputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            draftModel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            sampling: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"Greedy">;
            }, z.core.$strip>, z.ZodObject<{
                temperature: z.ZodNumber;
                topK: z.ZodInt;
                topP: z.ZodNumber;
                minP: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"Temperature">;
            }, z.core.$strip>, z.ZodObject<{
                tau: z.ZodNumber;
                eta: z.ZodNumber;
                seed: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                type: z.ZodLiteral<"MirostatV2">;
            }, z.core.$strip>]>>>;
            repeatPenalty: z.ZodNumber;
            repeatLastN: z.ZodInt;
            frequencyPenalty: z.ZodNumber;
            presencePenalty: z.ZodNumber;
            nBatch: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            nGpuLayers: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            useMlock: z.ZodBoolean;
            flashAttention: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            nThreads: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
            toolCalling: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                auto: "auto";
                force_native: "force_native";
                force_emulated: "force_emulated";
            }>>>;
            chatTemplate: z.ZodDefault<z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
                type: z.ZodLiteral<"embedded">;
            }, z.core.$strip>, z.ZodObject<{
                name: z.ZodString;
                type: z.ZodLiteral<"builtin">;
            }, z.core.$strip>, z.ZodObject<{
                template: z.ZodString;
                type: z.ZodLiteral<"custom_inline">;
            }, z.core.$strip>]>>>;
            enableThinking: z.ZodBoolean;
            visionCapable: z.ZodBoolean;
            imageTokenEstimate: z.ZodInt;
            mmprojSizeBytes: z.ZodInt;
        }, z.core.$strip>;
    }, z.core.$strip>, z.ZodObject<{
        models: z.ZodArray<z.ZodObject<{
            repoId: z.ZodString;
            author: z.ZodString;
            modelName: z.ZodString;
            downloads: z.ZodInt;
            ggufFiles: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                filename: z.ZodString;
                sizeBytes: z.ZodInt;
                quantization: z.ZodString;
                downloadUrl: z.ZodString;
            }, z.core.$strip>>>>;
            variants: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
                variantId: z.ZodString;
                label: z.ZodString;
                backendId: z.ZodString;
                format: z.ZodString;
                modelId: z.ZodString;
                downloadId: z.ZodString;
                sizeBytes: z.ZodInt;
                filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                description: z.ZodString;
                qualityRank: z.ZodInt;
                sharded: z.ZodBoolean;
                supported: z.ZodBoolean;
                unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        variants: z.ZodArray<z.ZodObject<{
            variantId: z.ZodString;
            label: z.ZodString;
            backendId: z.ZodString;
            format: z.ZodString;
            modelId: z.ZodString;
            downloadId: z.ZodString;
            sizeBytes: z.ZodInt;
            filename: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            downloadUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            description: z.ZodString;
            qualityRank: z.ZodInt;
            sharded: z.ZodBoolean;
            supported: z.ZodBoolean;
            unsupportedReason: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>;
        recommendedIndex: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
        availableMemoryBytes: z.ZodInt;
        downloadedQuants: z.ZodArray<z.ZodString>;
        downloadedVariants: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        templates: z.ZodArray<z.ZodString>;
    }, z.core.$strip>]>, z.ZodUnknown]>>;
}, z.core.$strip>, z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodInt;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>;
    id: z.ZodString;
}, z.core.$strip>]>;
export declare const zExtNotification: z.ZodObject<{
    method: z.ZodString;
    params: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodUnion<readonly [z.ZodObject<{
        sessionId: z.ZodString;
        update: z.ZodDiscriminatedUnion<[z.ZodObject<{
            used: z.ZodInt;
            contextLimit: z.ZodInt;
            accumulatedInputTokens: z.ZodInt;
            accumulatedOutputTokens: z.ZodInt;
            accumulatedCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            sessionUpdate: z.ZodLiteral<"usage_update">;
        }, z.core.$strip>, z.ZodObject<{
            status: z.ZodUnion<readonly [z.ZodObject<{
                message: z.ZodString;
                type: z.ZodLiteral<"notice">;
            }, z.core.$strip>, z.ZodObject<{
                message: z.ZodString;
                type: z.ZodLiteral<"progress">;
            }, z.core.$strip>]>;
            sessionUpdate: z.ZodLiteral<"status_message">;
        }, z.core.$strip>, z.ZodObject<{
            messageId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            usage: z.ZodObject<{
                inputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                outputTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                totalTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cacheReadTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cacheWriteTokens: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                costSource: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodLiteral<"provider_reported">, z.ZodLiteral<"estimated">]>>>;
                elapsedMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                timeToFirstTokenMs: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
                isCompaction: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, z.core.$strip>;
            sessionUpdate: z.ZodLiteral<"message_usage">;
        }, z.core.$strip>], "sessionUpdate">;
    }, z.core.$strip>, z.ZodObject<{
        providerId: z.ZodString;
        userCode: z.ZodString;
        verificationUri: z.ZodString;
        expiresIn: z.ZodInt;
    }, z.core.$strip>]>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>>;
}, z.core.$strip>;
export declare const zExtAgentRequest: z.ZodObject<{
    id: z.ZodString;
    method: z.ZodString;
    params: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodObject<{
        sessionId: z.ZodString;
        parameters: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            input_type: z.ZodEnum<{
                string: "string";
                number: "number";
                boolean: "boolean";
                date: "date";
                file: "file";
                select: "select";
            }>;
            requirement: z.ZodEnum<{
                optional: "optional";
                required: "required";
                user_prompt: "user_prompt";
            }>;
            description: z.ZodString;
            default: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            options: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        }, z.core.$strip>>;
        parameterScopeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodUnknown>]>>>;
}, z.core.$strip>;
export declare const zExtAgentResponse: z.ZodUnion<readonly [z.ZodObject<{
    id: z.ZodString;
    result: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        action: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            submit: "submit";
            cancel: "cancel";
        }>>>;
        values: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
    }, z.core.$strip>, z.ZodUnknown]>>;
}, z.core.$strip>, z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodInt;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>;
    id: z.ZodString;
}, z.core.$strip>]>;
//# sourceMappingURL=zod.gen.d.ts.map