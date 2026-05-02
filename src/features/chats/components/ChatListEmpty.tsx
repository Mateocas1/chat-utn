export function ChatListEmpty() {
  return (
    <section className="px-6 py-10 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-surface-2" aria-hidden="true" />
      <p className="text-sm font-semibold text-text">No chats yet</p>
      <p className="mt-1 text-sm text-muted">Start a new conversation to see it here.</p>
    </section>
  );
}
