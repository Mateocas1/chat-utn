import { Button } from '@/components/ui/Button';

type ChatListErrorProps = {
  onRetry: () => void;
};

export function ChatListError({ onRetry }: ChatListErrorProps) {
  return (
    <section className="flex flex-col items-center gap-3 px-4 py-6 text-center">
      <p className="text-sm text-danger">No pudimos cargar los chats</p>
      <Button variant="accent" onClick={onRetry}>Try again</Button>
    </section>
  );
}
