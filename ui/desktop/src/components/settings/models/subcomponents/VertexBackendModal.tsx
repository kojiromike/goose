import { useState } from 'react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { defineMessages, useIntl } from '../../../../i18n';
import { acpConfigureLlmBackend, type LlmBackendStatus } from '../../../../acp/llmBackend';

const i18n = defineMessages({
  title: {
    id: 'vertexBackendModal.title',
    defaultMessage: 'Vertex AI',
  },
  description: {
    id: 'vertexBackendModal.description',
    defaultMessage:
      'Route Claude Code through your Google Cloud project. Signing in to Google Cloud happens when you select this backend.',
  },
  project: {
    id: 'vertexBackendModal.project',
    defaultMessage: 'Project ID',
  },
  region: {
    id: 'vertexBackendModal.region',
    defaultMessage: 'Region',
  },
  model: {
    id: 'vertexBackendModal.model',
    defaultMessage: 'Model',
  },
  modelHelp: {
    id: 'vertexBackendModal.modelHelp',
    defaultMessage:
      'Vertex spells model ids differently and has no 1M context lane, so it needs its own model.',
  },
  cancel: {
    id: 'vertexBackendModal.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'vertexBackendModal.save',
    defaultMessage: 'Save',
  },
});

interface VertexBackendModalProps {
  sessionId: string;
  projectId: string;
  region: string;
  model: string;
  onSaved: (status: LlmBackendStatus) => void;
  onClose: () => void;
}

export function VertexBackendModal({
  sessionId,
  projectId,
  region,
  model,
  onSaved,
  onClose,
}: VertexBackendModalProps) {
  const intl = useIntl();
  const [project, setProject] = useState(projectId);
  const [location, setLocation] = useState(region);
  const [vertexModel, setVertexModel] = useState(model);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave =
    project.trim() !== '' && location.trim() !== '' && vertexModel.trim() !== '' && !saving;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const status = await acpConfigureLlmBackend(
        sessionId,
        { projectId: project.trim(), region: location.trim() },
        vertexModel.trim()
      );
      onSaved(status);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background-primary border border-border-primary rounded-lg shadow-lg w-[420px] p-4">
        <h3 className="text-sm font-medium text-text-default">
          {intl.formatMessage(i18n.title)}
        </h3>
        <p className="text-xs text-text-muted mt-1">{intl.formatMessage(i18n.description)}</p>

        <label className="block text-xs text-text-primary mt-4 mb-1" htmlFor="vertex-project">
          {intl.formatMessage(i18n.project)}
        </label>
        <Input
          id="vertex-project"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          placeholder="my-gcp-project"
        />

        <label className="block text-xs text-text-primary mt-3 mb-1" htmlFor="vertex-region">
          {intl.formatMessage(i18n.region)}
        </label>
        <Input
          id="vertex-region"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="us-east5"
        />

        <label className="block text-xs text-text-primary mt-3 mb-1" htmlFor="vertex-model">
          {intl.formatMessage(i18n.model)}
        </label>
        <Input
          id="vertex-model"
          value={vertexModel}
          onChange={(event) => setVertexModel(event.target.value)}
          placeholder="claude-opus-5@20260514"
        />
        <p className="text-xs text-text-muted mt-1">{intl.formatMessage(i18n.modelHelp)}</p>

        {error && <p className="text-xs text-text-error mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={onClose}>
            {intl.formatMessage(i18n.cancel)}
          </Button>
          <Button disabled={!canSave} onClick={() => void handleSave()}>
            {intl.formatMessage(i18n.save)}
          </Button>
        </div>
      </div>
    </div>
  );
}
