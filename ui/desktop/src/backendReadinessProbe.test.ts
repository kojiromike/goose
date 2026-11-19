import { EventEmitter } from 'node:events';
import type { IncomingMessage } from 'node:http';
import type { RequestOptions } from 'node:https';
import { describe, expect, it, vi } from 'vitest';
import { createBackendReadinessProbe } from './backendReadinessProbe';

const FINGERPRINT = 'AB:CD:EF';

function fakeGet(statusCode: number, fingerprint: string | null = FINGERPRINT) {
  const response = {
    statusCode,
    socket: { getPeerCertificate: () => ({ fingerprint256: fingerprint ?? undefined }) },
    resume: vi.fn(),
    destroy: vi.fn(),
  };
  const calls: Array<{ url: URL; options: RequestOptions }> = [];
  const get = vi.fn(
    (url: URL, options: RequestOptions, callback: (response: IncomingMessage) => void) => {
      calls.push({ url, options });
      void Promise.resolve().then(() => callback(response as unknown as IncomingMessage));
      return new EventEmitter();
    }
  );
  return { get, calls, response };
}

describe('createBackendReadinessProbe', () => {
  it('reports a trusted server that answers 200 as ready', async () => {
    const verify = vi.fn(() => true);
    const { get, calls, response } = fakeGet(200);
    const signal = new AbortController().signal;

    const result = await createBackendReadinessProbe(verify, get)('https://127.0.0.1:4000/status', {
      signal,
    });

    expect(result).toEqual({ ok: true });
    expect(verify).toHaveBeenCalledWith('127.0.0.1', FINGERPRINT);
    expect(calls[0].options).toMatchObject({ rejectUnauthorized: false, signal });
    expect(response.resume).toHaveBeenCalled();
  });

  it('reports a server that is not healthy yet as not ready', async () => {
    const { get } = fakeGet(503);

    const result = await createBackendReadinessProbe(
      () => true,
      get
    )('https://127.0.0.1:4000/status');

    expect(result).toEqual({ ok: false });
  });

  it('rejects a certificate the trust check does not accept', async () => {
    const { get, response } = fakeGet(200);

    await expect(
      createBackendReadinessProbe(() => false, get)('https://127.0.0.1:4000/status')
    ).rejects.toThrow('Untrusted certificate for 127.0.0.1');
    expect(response.destroy).toHaveBeenCalled();
  });

  it('rejects a response without a peer certificate', async () => {
    const verify = vi.fn(() => true);
    const { get } = fakeGet(200, null);

    await expect(
      createBackendReadinessProbe(verify, get)('https://127.0.0.1:4000/status')
    ).rejects.toThrow('Untrusted certificate');
    expect(verify).not.toHaveBeenCalled();
  });

  it('rejects when the request fails', async () => {
    const request = new EventEmitter();
    const get = vi.fn(() => {
      void Promise.resolve().then(() => request.emit('error', new Error('ECONNREFUSED')));
      return request;
    });

    await expect(
      createBackendReadinessProbe(() => true, get)('https://127.0.0.1:4000/status')
    ).rejects.toThrow('ECONNREFUSED');
  });
});
