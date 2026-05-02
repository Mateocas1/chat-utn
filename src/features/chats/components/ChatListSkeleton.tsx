export function ChatListSkeleton() {
  return (
    <ul aria-busy="true" aria-label="Loading chats" className="space-y-3 px-4 py-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-surface-2" aria-hidden="true" />
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-2/3 rounded-full bg-surface-2" aria-hidden="true" />
            <span className="block h-3 w-1/2 rounded-full bg-surface-2" aria-hidden="true" />
          </div>
        </li>
      ))}
    </ul>
  );
}
