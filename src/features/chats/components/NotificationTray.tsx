import { Toast } from '@/components/ui/Toast';

export type NotificationTrayVariant = 'status' | 'success' | 'warning' | 'error';

export type NotificationTrayItem = {
  id: string;
  title: string;
  message?: string;
  variant?: NotificationTrayVariant;
};

export type NotificationTrayProps = {
  isVisible: boolean;
  items: NotificationTrayItem[];
  onDismiss?: (id: string) => void;
};

const statusDotByVariant: Record<NotificationTrayVariant, string> = {
  status: 'bg-accent/45',
  success: 'bg-success/50',
  warning: 'bg-accent/55',
  error: 'bg-danger/60',
};

const toastVariantByNotificationVariant: Record<NotificationTrayVariant, 'default' | 'accent' | 'danger' | 'ghost'> = {
  status: 'default',
  success: 'accent',
  warning: 'ghost',
  error: 'danger'
};

export function NotificationTray({ isVisible, items, onDismiss }: NotificationTrayProps) {
  if (!isVisible || items.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Notifications"
      className="border-border bg-panel/80 text-muted border-b px-4 py-2"
    >
      <ul className="space-y-2" role="list">
        {items.map((item) => {
          const variant = item.variant ?? 'status';

          return (
            <li
              key={item.id}
              className="border-border/80 bg-surface/70 flex items-start gap-2 rounded-[--radius-sm] border px-3 py-2"
            >
              <span
                aria-label="Notification status"
                className={[
                  'mt-1 inline-block size-2 shrink-0 rounded-full',
                  statusDotByVariant[variant],
                ].join(' ')}
              />

              <div className="min-w-0 flex-1">
                <Toast
                  title={item.title}
                  description={item.message}
                  variant={toastVariantByNotificationVariant[variant]}
                />
              </div>

              {onDismiss ? (
                <button
                  type="button"
                  aria-label={`Dismiss ${item.title}`}
                  className="text-muted hover:bg-surface-2 hover:text-text rounded-[--radius-sm] px-2 py-1 text-[11px] transition-colors"
                  onClick={() => onDismiss(item.id)}
                >
                  Dismiss
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
