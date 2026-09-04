// This file is auto-generated — do not edit manually.
import { zAppsDeleteResponse_unstable, zAppsExportResponse_unstable, zAppsImportResponse_unstable, zAppsListResponse_unstable, zCanonicalModelInfoResponse_unstable, zConfigReadAllResponse_unstable, zConfigReadResponse_unstable, zCreateScheduleResponse_unstable, zCreateSourceResponse_unstable, zCustomProviderCreateResponse_unstable, zCustomProviderDeleteResponse_unstable, zCustomProviderReadResponse_unstable, zCustomProviderUpdateResponse_unstable, zDecodeRecipeResponse_unstable, zDefaultsReadResponse_unstable, zDiagnosticsGetResponse_unstable, zDictationConfigResponse_unstable, zDictationModelDownloadProgressResponse_unstable, zDictationModelsListResponse_unstable, zDictationTranscribeResponse_unstable, zEncodeRecipeResponse_unstable, zExportSessionResponse_unstable, zExportSourceResponse_unstable, zGetConfigExtensionsResponse_unstable, zGetPromptResponse_unstable, zGetSessionExtensionsResponse_unstable, zGetSessionInfoResponse_unstable, zGetToolsResponse_unstable, zGooseToolCallResponse_unstable, zImportSessionResponse_unstable, zImportSourcesResponse_unstable, zInspectRunningJobResponse_unstable, zKillRunningJobResponse_unstable, zListAgentMentionsResponse_unstable, zListPromptsResponse_unstable, zListProvidersResponse_unstable, zListRecipesResponse_unstable, zListScheduleSessionsResponse_unstable, zListSchedulesResponse_unstable, zListSlashCommandsResponse_unstable, zListSourcesResponse_unstable, zLocalInferenceBuiltinChatTemplatesListResponse_unstable, zLocalInferenceHuggingFaceRepoVariantsResponse_unstable, zLocalInferenceHuggingFaceSearchResponse_unstable, zLocalInferenceModelDownloadProgressResponse_unstable, zLocalInferenceModelDownloadResponse_unstable, zLocalInferenceModelSettingsReadResponse_unstable, zLocalInferenceModelSettingsUpdateResponse_unstable, zLocalInferenceModelsListResponse_unstable, zOnboardingImportApplyResponse_unstable, zOnboardingImportScanResponse_unstable, zParseRecipeResponse_unstable, zPreferencesReadResponse_unstable, zPromptOperationResponse_unstable, zProviderCatalogListResponse_unstable, zProviderCatalogTemplateResponse_unstable, zProviderConfigChangeResponse_unstable, zProviderConfigReadResponse_unstable, zProviderConfigStatusResponse_unstable, zProviderReadinessCheckResponse_unstable, zProviderSecretsListResponse_unstable, zProviderSessionsListResponse_unstable, zProviderSetupCatalogListResponse_unstable, zProviderSupportedModelsListResponse_unstable, zReadResourceResponse_unstable, zRecipeToYamlResponse_unstable, zRefreshProviderInventoryResponse_unstable, zRunScheduleNowResponse_unstable, zSaveRecipeResponse_unstable, zScanRecipeResponse_unstable, zSetToolPermissionsResponse_unstable, zShareSessionNostrResponse_unstable, zSteerSessionResponse_unstable, zUpdateScheduleResponse_unstable, zUpdateSourceResponse_unstable, } from './zod.gen.js';
export class GooseExtClient {
    conn;
    constructor(conn) {
        this.conn = conn;
    }
    async sessionExtensionsAdd_unstable(params) {
        await this.conn.request("_goose/unstable/session/extensions/add", params);
    }
    async sessionExtensionsRemove_unstable(params) {
        await this.conn.request("_goose/unstable/session/extensions/remove", params);
    }
    async toolsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/tools/list", params);
        return zGetToolsResponse_unstable.parse(raw);
    }
    async toolsPermissionsSet_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/tools/permissions/set", params);
        return zSetToolPermissionsResponse_unstable.parse(raw);
    }
    async toolsCall_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/tools/call", params);
        return zGooseToolCallResponse_unstable.parse(raw);
    }
    async resourcesRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/resources/read", params);
        return zReadResourceResponse_unstable.parse(raw);
    }
    async appsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/apps/list", params);
        return zAppsListResponse_unstable.parse(raw);
    }
    async appsExport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/apps/export", params);
        return zAppsExportResponse_unstable.parse(raw);
    }
    async appsImport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/apps/import", params);
        return zAppsImportResponse_unstable.parse(raw);
    }
    async appsDelete_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/apps/delete", params);
        return zAppsDeleteResponse_unstable.parse(raw);
    }
    async sessionWorkingDirUpdate_unstable(params) {
        await this.conn.request("_goose/unstable/session/working-dir/update", params);
    }
    async sessionSystemPromptSet_unstable(params) {
        await this.conn.request("_goose/unstable/session/system-prompt/set", params);
    }
    async sessionSteer_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/steer", params);
        return zSteerSessionResponse_unstable.parse(raw);
    }
    async diagnosticsGet_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/diagnostics/get", params);
        return zDiagnosticsGetResponse_unstable.parse(raw);
    }
    async configPromptsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/prompts/list", params);
        return zListPromptsResponse_unstable.parse(raw);
    }
    async configPromptsGet_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/prompts/get", params);
        return zGetPromptResponse_unstable.parse(raw);
    }
    async configPromptsSave_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/prompts/save", params);
        return zPromptOperationResponse_unstable.parse(raw);
    }
    async configPromptsReset_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/prompts/reset", params);
        return zPromptOperationResponse_unstable.parse(raw);
    }
    async configExtensionsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/extensions/list", params);
        return zGetConfigExtensionsResponse_unstable.parse(raw);
    }
    async configExtensionsAdd_unstable(params) {
        await this.conn.request("_goose/unstable/config/extensions/add", params);
    }
    async configExtensionsRemove_unstable(params) {
        await this.conn.request("_goose/unstable/config/extensions/remove", params);
    }
    async configExtensionsSetEnabled_unstable(params) {
        await this.conn.request("_goose/unstable/config/extensions/set-enabled", params);
    }
    async sessionExtensionsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/extensions/list", params);
        return zGetSessionExtensionsResponse_unstable.parse(raw);
    }
    async providersList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/list", params);
        return zListProvidersResponse_unstable.parse(raw);
    }
    async providersSupportedModelsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/supported-models/list", params);
        return zProviderSupportedModelsListResponse_unstable.parse(raw);
    }
    async providersCatalogList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/catalog/list", params);
        return zProviderCatalogListResponse_unstable.parse(raw);
    }
    async providersSetupCatalogList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/setup/catalog/list", params);
        return zProviderSetupCatalogListResponse_unstable.parse(raw);
    }
    async providersCatalogTemplate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/catalog/template", params);
        return zProviderCatalogTemplateResponse_unstable.parse(raw);
    }
    async providersCustomCreate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/custom/create", params);
        return zCustomProviderCreateResponse_unstable.parse(raw);
    }
    async providersCustomRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/custom/read", params);
        return zCustomProviderReadResponse_unstable.parse(raw);
    }
    async providersCustomUpdate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/custom/update", params);
        return zCustomProviderUpdateResponse_unstable.parse(raw);
    }
    async providersCustomDelete_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/custom/delete", params);
        return zCustomProviderDeleteResponse_unstable.parse(raw);
    }
    async providersInventoryRefresh_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/inventory/refresh", params);
        return zRefreshProviderInventoryResponse_unstable.parse(raw);
    }
    async providersReadinessCheck_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/readiness/check", params);
        return zProviderReadinessCheckResponse_unstable.parse(raw);
    }
    async providersConfigRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/config/read", params);
        return zProviderConfigReadResponse_unstable.parse(raw);
    }
    async providersConfigStatus_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/config/status", params);
        return zProviderConfigStatusResponse_unstable.parse(raw);
    }
    async providersConfigSave_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/config/save", params);
        return zProviderConfigChangeResponse_unstable.parse(raw);
    }
    async providersConfigDelete_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/config/delete", params);
        return zProviderConfigChangeResponse_unstable.parse(raw);
    }
    async providersConfigAuthenticate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/config/authenticate", params);
        return zProviderConfigChangeResponse_unstable.parse(raw);
    }
    async providersSecretsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/secrets/list", params);
        return zProviderSecretsListResponse_unstable.parse(raw);
    }
    async providersSecretsDelete_unstable(params) {
        await this.conn.request("_goose/unstable/providers/secrets/delete", params);
    }
    async providersCanonicalModelInfo_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/canonical-model-info", params);
        return zCanonicalModelInfoResponse_unstable.parse(raw);
    }
    async preferencesRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/preferences/read", params);
        return zPreferencesReadResponse_unstable.parse(raw);
    }
    async preferencesSave_unstable(params) {
        await this.conn.request("_goose/unstable/preferences/save", params);
    }
    async configRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/read", params);
        return zConfigReadResponse_unstable.parse(raw);
    }
    async configUpsert_unstable(params) {
        await this.conn.request("_goose/unstable/config/upsert", params);
    }
    async configRemove_unstable(params) {
        await this.conn.request("_goose/unstable/config/remove", params);
    }
    async configReadAll_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/config/read-all", params);
        return zConfigReadAllResponse_unstable.parse(raw);
    }
    async defaultsRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/defaults/read", params);
        return zDefaultsReadResponse_unstable.parse(raw);
    }
    async defaultsSave_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/defaults/save", params);
        return zDefaultsReadResponse_unstable.parse(raw);
    }
    async defaultsClear_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/defaults/clear", params);
        return zDefaultsReadResponse_unstable.parse(raw);
    }
    async onboardingImportScan_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/onboarding/import/scan", params);
        return zOnboardingImportScanResponse_unstable.parse(raw);
    }
    async onboardingImportApply_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/onboarding/import/apply", params);
        return zOnboardingImportApplyResponse_unstable.parse(raw);
    }
    async sessionExport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/export", params);
        return zExportSessionResponse_unstable.parse(raw);
    }
    async sessionImport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/import", params);
        return zImportSessionResponse_unstable.parse(raw);
    }
    async providersSessionsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/providers/sessions/list", params);
        return zProviderSessionsListResponse_unstable.parse(raw);
    }
    async sessionShareNostr_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/share/nostr", params);
        return zShareSessionNostrResponse_unstable.parse(raw);
    }
    async recipesEncode_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/encode", params);
        return zEncodeRecipeResponse_unstable.parse(raw);
    }
    async recipesDecode_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/decode", params);
        return zDecodeRecipeResponse_unstable.parse(raw);
    }
    async recipesScan_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/scan", params);
        return zScanRecipeResponse_unstable.parse(raw);
    }
    async recipesList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/list", params);
        return zListRecipesResponse_unstable.parse(raw);
    }
    async recipesDelete_unstable(params) {
        await this.conn.request("_goose/unstable/recipes/delete", params);
    }
    async recipesSchedule_unstable(params) {
        await this.conn.request("_goose/unstable/recipes/schedule", params);
    }
    async recipesSlashCommand_unstable(params) {
        await this.conn.request("_goose/unstable/recipes/slash-command", params);
    }
    async recipesSave_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/save", params);
        return zSaveRecipeResponse_unstable.parse(raw);
    }
    async recipesParse_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/parse", params);
        return zParseRecipeResponse_unstable.parse(raw);
    }
    async recipesToYaml_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/recipes/to-yaml", params);
        return zRecipeToYamlResponse_unstable.parse(raw);
    }
    async schedulesList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/list", params);
        return zListSchedulesResponse_unstable.parse(raw);
    }
    async schedulesSessionsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/sessions/list", params);
        return zListScheduleSessionsResponse_unstable.parse(raw);
    }
    async schedulesCreate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/create", params);
        return zCreateScheduleResponse_unstable.parse(raw);
    }
    async schedulesDelete_unstable(params) {
        await this.conn.request("_goose/unstable/schedules/delete", params);
    }
    async schedulesPause_unstable(params) {
        await this.conn.request("_goose/unstable/schedules/pause", params);
    }
    async schedulesUnpause_unstable(params) {
        await this.conn.request("_goose/unstable/schedules/unpause", params);
    }
    async schedulesUpdate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/update", params);
        return zUpdateScheduleResponse_unstable.parse(raw);
    }
    async schedulesRunNow_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/run-now", params);
        return zRunScheduleNowResponse_unstable.parse(raw);
    }
    async schedulesRunningJobKill_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/running-job/kill", params);
        return zKillRunningJobResponse_unstable.parse(raw);
    }
    async schedulesRunningJobInspect_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/schedules/running-job/inspect", params);
        return zInspectRunningJobResponse_unstable.parse(raw);
    }
    async sessionInfo_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/session/info", params);
        return zGetSessionInfoResponse_unstable.parse(raw);
    }
    async sessionConversationTruncate_unstable(params) {
        await this.conn.request("_goose/unstable/session/conversation/truncate", params);
    }
    async sessionProjectUpdate_unstable(params) {
        await this.conn.request("_goose/unstable/session/project/update", params);
    }
    async sessionRename_unstable(params) {
        await this.conn.request("_goose/unstable/session/rename", params);
    }
    async sessionArchive_unstable(params) {
        await this.conn.request("_goose/unstable/session/archive", params);
    }
    async sessionUnarchive_unstable(params) {
        await this.conn.request("_goose/unstable/session/unarchive", params);
    }
    async sourcesCreate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/sources/create", params);
        return zCreateSourceResponse_unstable.parse(raw);
    }
    async sourcesList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/sources/list", params);
        return zListSourcesResponse_unstable.parse(raw);
    }
    async agentMentionsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/agent-mentions/list", params);
        return zListAgentMentionsResponse_unstable.parse(raw);
    }
    async slashCommandsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/slash-commands/list", params);
        return zListSlashCommandsResponse_unstable.parse(raw);
    }
    async sourcesUpdate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/sources/update", params);
        return zUpdateSourceResponse_unstable.parse(raw);
    }
    async sourcesDelete_unstable(params) {
        await this.conn.request("_goose/unstable/sources/delete", params);
    }
    async sourcesExport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/sources/export", params);
        return zExportSourceResponse_unstable.parse(raw);
    }
    async sourcesImport_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/sources/import", params);
        return zImportSourcesResponse_unstable.parse(raw);
    }
    async dictationTranscribe_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/dictation/transcribe", params);
        return zDictationTranscribeResponse_unstable.parse(raw);
    }
    async dictationConfig_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/dictation/config", params);
        return zDictationConfigResponse_unstable.parse(raw);
    }
    async dictationModelsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/dictation/models/list", params);
        return zDictationModelsListResponse_unstable.parse(raw);
    }
    async dictationModelsDownload_unstable(params) {
        await this.conn.request("_goose/unstable/dictation/models/download", params);
    }
    async dictationModelsDownloadProgress_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/dictation/models/download/progress", params);
        return zDictationModelDownloadProgressResponse_unstable.parse(raw);
    }
    async dictationModelsCancel_unstable(params) {
        await this.conn.request("_goose/unstable/dictation/models/cancel", params);
    }
    async dictationModelsDelete_unstable(params) {
        await this.conn.request("_goose/unstable/dictation/models/delete", params);
    }
    async localInferenceModelsList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/models/list", params);
        return zLocalInferenceModelsListResponse_unstable.parse(raw);
    }
    async localInferenceModelsDownload_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/models/download", params);
        return zLocalInferenceModelDownloadResponse_unstable.parse(raw);
    }
    async localInferenceModelsDownloadProgress_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/models/download/progress", params);
        return zLocalInferenceModelDownloadProgressResponse_unstable.parse(raw);
    }
    async localInferenceModelsDownloadCancel_unstable(params) {
        await this.conn.request("_goose/unstable/local-inference/models/download/cancel", params);
    }
    async localInferenceModelsDelete_unstable(params) {
        await this.conn.request("_goose/unstable/local-inference/models/delete", params);
    }
    async localInferenceModelsEvict_unstable(params) {
        await this.conn.request("_goose/unstable/local-inference/models/evict", params);
    }
    async localInferenceModelsSettingsRead_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/models/settings/read", params);
        return zLocalInferenceModelSettingsReadResponse_unstable.parse(raw);
    }
    async localInferenceModelsSettingsUpdate_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/models/settings/update", params);
        return zLocalInferenceModelSettingsUpdateResponse_unstable.parse(raw);
    }
    async localInferenceHuggingfaceSearch_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/huggingface/search", params);
        return zLocalInferenceHuggingFaceSearchResponse_unstable.parse(raw);
    }
    async localInferenceHuggingfaceRepoVariants_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/huggingface/repo/variants", params);
        return zLocalInferenceHuggingFaceRepoVariantsResponse_unstable.parse(raw);
    }
    async localInferenceChatTemplatesBuiltinList_unstable(params) {
        const raw = await this.conn.request("_goose/unstable/local-inference/chat-templates/builtin/list", params);
        return zLocalInferenceBuiltinChatTemplatesListResponse_unstable.parse(raw);
    }
}
