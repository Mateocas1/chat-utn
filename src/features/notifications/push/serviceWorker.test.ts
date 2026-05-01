import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

type PushHandler = (event: {
  data?: { json: () => unknown; text: () => string };
  waitUntil: (promise: Promise<unknown>) => void;
}) => void;

const loadPushHandler = () => {
  const listeners = new Map<string, (event: unknown) => void>();
  const showNotification = vi.fn().mockResolvedValue(undefined);

  const context = vm.createContext({
    self: {
      skipWaiting: vi.fn(),
      clients: {
        claim: vi.fn().mockResolvedValue(undefined)
      },
      registration: {
        showNotification
      },
      addEventListener: (type: string, handler: (event: unknown) => void) => {
        listeners.set(type, handler);
      }
    }
  });

  const source = readFileSync(resolve(process.cwd(), 'public/service-worker.js'), 'utf8');
  vm.runInContext(source, context);

  return {
    pushHandler: listeners.get('push') as PushHandler,
    showNotification
  };
};

describe('service-worker push events', () => {
  it('shows notification from JSON payload', async () => {
    const { pushHandler, showNotification } = loadPushHandler();
    const waitUntil = vi.fn();

    pushHandler({
      data: {
        json: () => ({ title: 'New message', body: 'Hello there', tag: 'thread-1', data: { threadId: 'thread-1' } }),
        text: () => ''
      },
      waitUntil
    });

    const promise = waitUntil.mock.calls[0]?.[0] as Promise<unknown>;
    await promise;

    expect(waitUntil).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith('New message', {
      body: 'Hello there',
      tag: 'thread-1',
      data: { threadId: 'thread-1' }
    });
  });

  it('uses text payload fallback when JSON parsing fails', async () => {
    const { pushHandler, showNotification } = loadPushHandler();
    const waitUntil = vi.fn();

    pushHandler({
      data: {
        json: () => {
          throw new Error('invalid json');
        },
        text: () => 'plain text payload'
      },
      waitUntil
    });

    const promise = waitUntil.mock.calls[0]?.[0] as Promise<unknown>;
    await promise;

    expect(showNotification).toHaveBeenCalledWith('New message', {
      body: 'plain text payload',
      tag: 'chat-notification',
      data: undefined
    });
  });

  it('suppresses display during quiet hours from payload', async () => {
    const { pushHandler, showNotification } = loadPushHandler();
    const waitUntil = vi.fn();

    pushHandler({
      data: {
        json: () => ({
          title: 'Muted alert',
          body: 'should not show',
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '07:00'
          },
          now: '2026-01-01T23:30:00'
        }),
        text: () => ''
      },
      waitUntil
    });

    const promise = waitUntil.mock.calls[0]?.[0] as Promise<unknown>;
    await promise;

    expect(showNotification).not.toHaveBeenCalled();
    expect(waitUntil).not.toHaveBeenCalled();
  });

  it('shows notification when quietHours is absent', async () => {
    const { pushHandler, showNotification } = loadPushHandler();
    const waitUntil = vi.fn();

    pushHandler({
      data: {
        json: () => ({
          title: 'No quiet-hours contract',
          body: 'should show without suppression contract'
        }),
        text: () => ''
      },
      waitUntil
    });

    const promise = waitUntil.mock.calls[0]?.[0] as Promise<unknown>;
    await promise;

    expect(waitUntil).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith('No quiet-hours contract', {
      body: 'should show without suppression contract',
      tag: 'chat-notification',
      data: undefined
    });
  });

  it('falls back to display when quietHours.enabled is not true', async () => {
    const { pushHandler, showNotification } = loadPushHandler();
    const waitUntil = vi.fn();

    pushHandler({
      data: {
        json: () => ({
          title: 'Malformed quiet-hours payload',
          body: 'should still show',
          quietHours: {
            start: '22:00',
            end: '07:00'
          },
          now: '2026-01-01T23:30:00'
        }),
        text: () => ''
      },
      waitUntil
    });

    const promise = waitUntil.mock.calls[0]?.[0] as Promise<unknown>;
    await promise;

    expect(waitUntil).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith('Malformed quiet-hours payload', {
      body: 'should still show',
      tag: 'chat-notification',
      data: undefined
    });
  });
});
