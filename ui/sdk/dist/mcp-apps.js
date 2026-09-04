import { RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/app-bridge";
export const GOOSE_MCP_UI_EXTENSION_ID = "io.modelcontextprotocol/ui";
export const DEFAULT_GOOSE_MCP_HOST_CAPABILITIES = {
    extensions: {
        [GOOSE_MCP_UI_EXTENSION_ID]: {
            mimeTypes: [RESOURCE_MIME_TYPE],
        },
    },
};
