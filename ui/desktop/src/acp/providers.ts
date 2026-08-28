import type {
  CanonicalModelInfoDto,
  CustomProviderCreateRequest_unstable,
  CustomProviderReadResponse_unstable,
  ProviderInventoryEntryDto,
  ProviderInventoryModelDto,
  ProviderSecretDto,
  ProviderInventoryEntryDto,
  RefreshProviderInventoryResponse_unstable,
  ProviderTemplateCatalogEntryDto,
  ProviderTemplateDto,
} from '@aaif/goose-sdk';
import { methods } from '@agentclientprotocol/sdk';
import type {
  ProviderDetails,
  ThinkingEffort,
  UpdateCustomProviderRequest,
} from '../types/providers';
import { getAcpClient } from './acpConnection';

export type { CanonicalModelInfoDto, ProviderSecretDto };

const INVENTORY_REFRESH_POLL_INTERVAL_MS = 100;
const INVENTORY_REFRESH_TIMEOUT_MS = 30_000;

function throwIfAborted(signal?: globalThis.AbortSignal) {
  if (signal?.aborted) throw new DOMException('The operation was aborted', 'AbortError');
}

function waitForInventoryPoll(signal?: globalThis.AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, INVENTORY_REFRESH_POLL_INTERVAL_MS);
    const abort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException('The operation was aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function providerEntryToDetails(entry: ProviderInventoryEntryDto): ProviderDetails {
  return {
    name: entry.providerId,
    is_configured: entry.configured,
    is_available: entry.available,
    is_refreshing: entry.refreshing,
    last_refresh_error: entry.lastRefreshError ?? null,
    supports_refresh: entry.supportsRefresh,
    visible_in_setup: entry.visibleInSetup,
    deprecated: entry.deprecated,
    replacement: entry.replacement ?? null,
    provider_type: entry.providerType as ProviderDetails['provider_type'],
    setup_category: entry.category,
    uses_acp: entry.acp ?? false,
    metadata: {
      name: entry.providerId,
      display_name: entry.providerName,
      description: entry.description,
      default_model: entry.defaultModel,
      model_doc_link: '',
      model_selection_hint: entry.modelSelectionHint ?? null,
      config_keys: entry.configKeys.map((key) => ({
        name: key.name,
        required: key.required,
        secret: key.secret,
        default: key.default ?? null,
        oauth_flow: key.oauthFlow ?? false,
        device_code_flow: key.deviceCodeFlow ?? false,
        primary: key.primary ?? false,
      })),
      known_models: entry.models.map((model) => ({
        name: model.id,
        context_limit: model.contextLimit ?? undefined,
        reasoning: model.reasoning ?? undefined,
      })),
      setup_steps: entry.setupSteps,
    },
  };
}

function updateRequestToCreate(
  request: UpdateCustomProviderRequest
): CustomProviderCreateRequest_unstable {
  return {
    engine: request.engine,
    displayName: request.display_name,
    apiUrl: request.api_url,
    apiKey: request.api_key || null,
    models: request.models,
    supportsStreaming: request.supports_streaming ?? null,
    headers: request.headers ?? undefined,
    requiresAuth: request.requires_auth ?? true,
    catalogProviderId: request.catalog_provider_id ?? null,
    basePath: request.base_path ?? null,
    preservesThinking: request.preserves_thinking ?? null,
  };
}

export async function acpListProviderDetails(): Promise<ProviderDetails[]> {
  const client = await getAcpClient();
  const { entries } = await client.goose.providersList_unstable({});
  return entries.map(providerEntryToDetails);
}

export async function acpListSetupProviderDetails(): Promise<ProviderDetails[]> {
  const providers = await acpListProviderDetails();
  return providers.filter((provider) => provider.visible_in_setup);
}

export async function acpListSettingsProviderDetails(): Promise<ProviderDetails[]> {
  const providers = await acpListProviderDetails();
  return providers.filter((provider) => provider.visible_in_setup || provider.is_configured);
}

export async function acpGetProviderDetails(providerId: string): Promise<ProviderDetails> {
  const client = await getAcpClient();
  const { entries } = await client.goose.providersList_unstable({ providerIds: [providerId] });
  const entry = entries.find((candidate) => candidate.providerId === providerId);
  if (!entry) throw new Error(`Unknown provider: ${providerId}`);
  return providerEntryToDetails(entry);
}

async function waitForProviderInventoryRefresh(
  client: Awaited<ReturnType<typeof getAcpClient>>,
  providerId: string,
  refresh: RefreshProviderInventoryResponse_unstable,
  signal?: globalThis.AbortSignal
): Promise<ProviderDetails> {
  const shouldWait =
    refresh.started.includes(providerId) ||
    refresh.skipped?.some(
      (skip) => skip.providerId === providerId && skip.reason === 'already_refreshing'
    );

  let entry: ProviderInventoryEntryDto | undefined;
  const attempts = shouldWait
    ? INVENTORY_REFRESH_TIMEOUT_MS / INVENTORY_REFRESH_POLL_INTERVAL_MS
    : 1;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    throwIfAborted(signal);
    const response = await client.goose.providersList_unstable({ providerIds: [providerId] });
    throwIfAborted(signal);
    entry = response.entries.find((candidate) => candidate.providerId === providerId);
    if (!entry) throw new Error(`Unknown provider: ${providerId}`);
    if (!entry.refreshing) return providerEntryToDetails(entry);
    await waitForInventoryPoll(signal);
  }

  if (!entry) throw new Error(`Unknown provider: ${providerId}`);
  throw new Error(`Timed out while checking ${entry.providerName}`);
}

export async function acpRefreshProviderDetails(
  providerId: string,
  signal?: globalThis.AbortSignal
): Promise<{
  provider: ProviderDetails;
  connectionChecked: boolean;
  readinessError: string | null;
}> {
  const client = await getAcpClient();
  throwIfAborted(signal);
  let { entries } = await client.goose.providersList_unstable({ providerIds: [providerId] });
  throwIfAborted(signal);
  let entry = entries.find((candidate) => candidate.providerId === providerId);
  if (!entry) throw new Error(`Unknown provider: ${providerId}`);

  if (!entry.available) {
    return {
      provider: providerEntryToDetails(entry),
      connectionChecked: false,
      readinessError: null,
    };
  }

  const readiness = await client.goose.providersReadinessCheck_unstable({ providerId });
  throwIfAborted(signal);
  if (!readiness.ready) {
    return {
      provider: providerEntryToDetails(entry),
      connectionChecked: true,
      readinessError: readiness.error ?? 'Provider is not ready',
    };
  }

  if (entry.supportsRefresh) {
    const refresh = await client.goose.providersInventoryRefresh_unstable({
      providerIds: [providerId],
    });
    const provider = await waitForProviderInventoryRefresh(client, providerId, refresh, signal);
    return { provider, connectionChecked: true, readinessError: null };
  }

  return {
    provider: providerEntryToDetails(entry),
    connectionChecked: true,
    readinessError: null,
  };
}

// Raw model ids from a provider's live supported-models API (e.g. Anthropic's /v1/models,
// or the model list an ACP adapter advertises). Unlike the inventory cache this is neither
// canonical-filtered nor asynchronously refreshed, so it reflects what the provider offers now.
export async function acpListProviderSupportedModels(providerId: string): Promise<string[]> {
  const client = await getAcpClient();
  const { models } = await client.goose.providersSupportedModelsList_unstable({ providerId });
  return models;
}

// Live discovery spawns/queries the provider, which can stall: Claude Code's control
// request waits indefinitely for a model_list response and HTTP providers can hang up to
// their request timeout. Bound it so a single slow provider can't leave the whole picker
// (RecipeModelSelector awaits every provider via Promise.all) loading forever.
const LIVE_MODELS_TIMEOUT_MS = 4000;

// Providers whose live supported-models endpoint returns *only* agent-usable models but whose
// inventory entry isn't category 'agent'. The first-party Anthropic API's /v1/models is all
// chat/tool-capable. 'claude-code' is the pre-ACP Claude Code provider: still registered, but
// absent from the curated setup catalog, so its category falls back to 'model' even though it
// advertises nothing but Claude's own aliases. Other model providers (OpenAI, Google,
// OpenRouter, …) also return embeddings, audio, and image models from their raw endpoint, which
// would fail an agent request; for those we keep the canonical-filtered inventory list instead.
const LIVE_UNION_MODEL_PROVIDERS = new Set(['anthropic', 'claude-code']);

// Whether to union a provider's live supported-models list into the picker. Agent adapters
// (category 'agent', e.g. Claude Code / Codex over ACP) advertise only the agent's own chat
// models, so their raw list is always safe; other providers must be explicitly allowlisted.
function shouldUnionLiveModels(entry: ProviderInventoryEntryDto | undefined): boolean {
  if (!entry) {
    return false;
  }
  return entry.category === 'agent' || LIVE_UNION_MODEL_PROVIDERS.has(entry.providerId);
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function acpListProviderModels(
  providerId: string
): Promise<ProviderInventoryModelDto[]> {
  const client = await getAcpClient();
  const { entries } = await client.goose.providersList_unstable({ providerIds: [providerId] });
  const entry = entries.find((e) => e.providerId === providerId);
  const inventory = entry?.models ?? [];

  // Only union the live list for providers whose supported-models endpoint returns exclusively
  // agent-usable models (see shouldUnionLiveModels). For the rest we keep the canonical-filtered
  // inventory so non-chat models (embeddings, audio, image) never leak into the picker.
  if (!shouldUnionLiveModels(entry)) {
    return inventory;
  }

  // The inventory cache is canonical-filtered and populated by a background refresh, so it
  // lags new releases and can silently drop models the key/adapter actually has (e.g. Opus 5,
  // or an ACP adapter's advertised aliases). Union in the live supported-models list so the
  // picker never hides a currently-available model. Live ids lead, in the order the backend
  // returns them — each provider owns its own ordering (the Anthropic provider sorts
  // newest-first); cached metadata (context limit, reasoning) is grafted on by id where we
  // have it.
  let liveIds: string[];
  try {
    liveIds = await withTimeout(
      acpListProviderSupportedModels(providerId),
      LIVE_MODELS_TIMEOUT_MS,
      `live model discovery for ${providerId}`
    );
  } catch {
    // Live discovery is best-effort; fall back to the inventory cache when it's slow or fails.
    return inventory;
  }

  const inventoryById = new Map(inventory.map((model) => [model.id, model]));
  const seen = new Set<string>();
  const merged: ProviderInventoryModelDto[] = [];
  for (const id of liveIds) {
    seen.add(id);
    merged.push(inventoryById.get(id) ?? { id, name: id });
  }
  for (const model of inventory) {
    if (!seen.has(model.id)) {
      merged.push(model);
    }
  }
  return merged;
}

export async function acpListProviderCatalogEntries(
  format?: string
): Promise<ProviderTemplateCatalogEntryDto[]> {
  const client = await getAcpClient();
  const { providers } = await client.goose.providersCatalogList_unstable(format ? { format } : {});
  return providers;
}

export async function acpGetProviderTemplate(providerId: string): Promise<ProviderTemplateDto> {
  const client = await getAcpClient();
  const { template } = await client.goose.providersCatalogTemplate_unstable({ providerId });
  return template;
}

export async function acpGetCustomProvider(
  providerId: string
): Promise<CustomProviderReadResponse_unstable> {
  const client = await getAcpClient();
  return client.goose.providersCustomRead_unstable({ providerId });
}

export async function acpCreateCustomProviderFromRequest(
  request: UpdateCustomProviderRequest
): Promise<{ provider_name: string }> {
  const client = await getAcpClient();
  const response = await client.goose.providersCustomCreate_unstable(
    updateRequestToCreate(request)
  );
  return { provider_name: response.providerId };
}

export async function acpUpdateCustomProviderFromRequest(
  providerId: string,
  request: UpdateCustomProviderRequest
): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersCustomUpdate_unstable({
    providerId,
    ...updateRequestToCreate(request),
  });
}

export async function acpDeleteCustomProvider(providerId: string): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersCustomDelete_unstable({ providerId });
}

export async function acpReadProviderConfig(providerId: string) {
  const client = await getAcpClient();
  const { fields } = await client.goose.providersConfigRead_unstable({ providerId });
  return fields;
}

export async function acpDeleteProviderConfig(providerId: string): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersConfigDelete_unstable({ providerId });
}

export async function acpSaveProviderConfig(
  providerId: string,
  fields: { key: string; value: string }[]
): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersConfigSave_unstable({ providerId, fields });
}

export async function acpEnableProvider(
  providerId: string,
  signal?: globalThis.AbortSignal
): Promise<ProviderDetails> {
  const client = await getAcpClient();
  throwIfAborted(signal);
  const { refresh } = await client.goose.providersConfigSave_unstable({
    providerId,
    fields: [],
  });
  throwIfAborted(signal);
  return waitForProviderInventoryRefresh(client, providerId, refresh, signal);
}

export async function acpAuthenticateProvider(providerId: string): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersConfigAuthenticate_unstable({ providerId });
}

export async function acpListProviderSecrets(): Promise<ProviderSecretDto[]> {
  const client = await getAcpClient();
  const { secrets } = await client.goose.providersSecretsList_unstable({});
  return secrets;
}

export async function acpDeleteProviderSecret(id: string): Promise<void> {
  const client = await getAcpClient();
  await client.goose.providersSecretsDelete_unstable({ id });
}

export async function acpGetCanonicalModelInfo(
  provider: string,
  model: string
): Promise<CanonicalModelInfoDto | null> {
  const client = await getAcpClient();
  const { modelInfo } = await client.goose.providersCanonicalModelInfo_unstable({
    provider,
    model,
  });
  return modelInfo ?? null;
}

export async function acpReadDefaults(): Promise<{
  providerId: string | null;
  modelId: string | null;
}> {
  const client = await getAcpClient();
  const response = await client.goose.defaultsRead_unstable({});
  return {
    providerId: response.providerId ?? null,
    modelId: response.modelId ?? null,
  };
}

export async function acpSaveDefaults(providerId: string, modelId?: string | null): Promise<void> {
  const client = await getAcpClient();
  await client.goose.defaultsSave_unstable({ providerId, modelId: modelId ?? null });
}

export async function acpClearDefaults(): Promise<void> {
  const client = await getAcpClient();
  await client.goose.defaultsClear_unstable({});
}

export async function acpReadThinkingEffort(): Promise<ThinkingEffort | null> {
  const client = await getAcpClient();
  const response = await client.goose.preferencesRead_unstable({ keys: ['gooseThinkingEffort'] });
  const value = response.values.find((v) => v.key === 'gooseThinkingEffort')?.value;
  return typeof value === 'string' ? (value as ThinkingEffort) : null;
}

export async function acpSaveThinkingEffort(effort: ThinkingEffort): Promise<void> {
  const client = await getAcpClient();
  await client.goose.preferencesSave_unstable({
    values: [{ key: 'gooseThinkingEffort', value: effort }],
  });
}

export type AppliedSessionProviderModel = {
  providerId?: string;
  modelId?: string;
};

function extractAppliedSessionProviderModel(configOptions: unknown): AppliedSessionProviderModel {
  if (!Array.isArray(configOptions)) {
    return {};
  }

  const applied: AppliedSessionProviderModel = {};

  for (const option of configOptions) {
    if (!option || typeof option !== 'object') {
      continue;
    }

    const id = 'id' in option ? option.id : undefined;
    if (id !== 'provider' && id !== 'model') {
      continue;
    }

    const currentValue = selectCurrentValue(option);
    if (typeof currentValue !== 'string') {
      continue;
    }

    if (id === 'provider') {
      applied.providerId = currentValue;
    } else {
      applied.modelId = currentValue;
    }
  }

  return applied;
}

function selectCurrentValue(kind: unknown): unknown {
  if (!kind || typeof kind !== 'object') {
    return undefined;
  }

  if ('type' in kind && kind.type === 'select' && 'currentValue' in kind) {
    return kind.currentValue;
  }

  return undefined;
}

/**
 * Switch the provider (and model) for an active session via ACP config options.
 *
 * Changing the provider on the server resets the session's model, so the model
 * is applied as a follow-up step when supplied.
 */
export async function acpSetSessionProviderModel(
  sessionId: string,
  providerId: string,
  modelId?: string | null,
  thinkingEffort?: ThinkingEffort | null
): Promise<AppliedSessionProviderModel> {
  const client = await getAcpClient();
  let response = await client.connection.agent.request(methods.agent.session.setConfigOption, {
    sessionId,
    configId: 'provider',
    value: providerId,
  });
  if (modelId) {
    response = await client.connection.agent.request(methods.agent.session.setConfigOption, {
      sessionId,
      configId: 'model',
      value: modelId,
    });
  }
  if (thinkingEffort != null) {
    response = await client.connection.agent.request(methods.agent.session.setConfigOption, {
      sessionId,
      configId: 'thinking_effort',
      value: thinkingEffort,
    });
  }

  return extractAppliedSessionProviderModel(response.configOptions);
}
