# Chat Realtime Contract Alignment

## Backend Contract Source of Truth

- Base API URL must not force `/api` suffix in frontend.
- Typing signal is HTTP-only: `POST /messages/typing`.
- Socket channel is inbound-only for typing and notifications events.

## Typing Signal

`MessageComposerContainer` sends typing through HTTP:

- Endpoint: `POST /messages/typing`
- Payload shape:

```json
{
  "chatId": "chat-123"
}
```

The socket router consumes server typing events with this payload:

```ts
type TypingEventPayload = {
  userId: string;
  chatId: string;
};
```

## Notification Event Payload

Realtime notifications handled by `socketEventRouter` must match:

```ts
type NotificationEventPayload = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
};
```

Server notifications are also fetched from `GET /notifications` and marked read via `PATCH /notifications/:id/read`.

## Push Registration Feature Flag

Push registration is gated by `VITE_PUSH_ENABLED`.

- `VITE_PUSH_ENABLED=true` → allows `POST /notifications/push-subscriptions`
- Any other value or missing variable → skips registration
