import type { PushPermissionState, QuietHours } from '@/features/chat/store/chatUIStore';
import { Dialog } from '@/components/ui/Dialog';

type NotificationSettingsPanelProps = {
  pushPermission: PushPermissionState;
  pushOptInDialogOpen: boolean;
  isSubmitting: boolean;
  threadEnabled: boolean;
  quietHours: QuietHours;
  onEnableClick: () => void;
  onConfirmEnable: () => void;
  onCancelEnable: () => void;
  onThreadEnabledChange: (enabled: boolean) => void;
  onQuietHoursEnabledChange: (enabled: boolean) => void;
  onQuietHoursStartChange: (start: string) => void;
  onQuietHoursEndChange: (end: string) => void;
};

const pushPermissionLabel: Record<PushPermissionState, string> = {
  default: 'Not enabled',
  granted: 'Enabled',
  denied: 'Blocked by browser',
  unsupported: 'Not supported'
};

export function NotificationSettingsPanel({
  pushPermission,
  pushOptInDialogOpen,
  isSubmitting,
  threadEnabled,
  quietHours,
  onEnableClick,
  onConfirmEnable,
  onCancelEnable,
  onThreadEnabledChange,
  onQuietHoursEnabledChange,
  onQuietHoursStartChange,
  onQuietHoursEndChange
}: NotificationSettingsPanelProps) {
  return (
    <section className="border-border bg-panel/60 border-b px-4 py-3" aria-label="Notification settings">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-muted">Push: {pushPermissionLabel[pushPermission]}</p>
        <button
          type="button"
          className="rounded-[--radius-sm] border border-border bg-surface px-3 py-1 text-xs text-text transition-colors hover:bg-surface-2"
          onClick={onEnableClick}
          disabled={pushPermission === 'granted' || isSubmitting}
        >
          Enable notifications
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-text sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <input
            aria-label="Thread notifications"
            type="checkbox"
            checked={threadEnabled}
            onChange={(event) => onThreadEnabledChange(event.target.checked)}
          />
          Thread notifications
        </label>

        <label className="flex items-center gap-2">
          <input
            aria-label="Quiet hours"
            type="checkbox"
            checked={quietHours.enabled}
            onChange={(event) => onQuietHoursEnabledChange(event.target.checked)}
          />
          Quiet hours
        </label>

        <label className="flex items-center gap-2">
          <span className="text-muted">Start</span>
          <input
            aria-label="Quiet hours start"
            type="time"
            value={quietHours.start}
            onChange={(event) => onQuietHoursStartChange(event.target.value)}
            className="rounded-[--radius-sm] border border-border bg-surface px-2 py-1"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-muted">End</span>
          <input
            aria-label="Quiet hours end"
            type="time"
            value={quietHours.end}
            onChange={(event) => onQuietHoursEndChange(event.target.value)}
            className="rounded-[--radius-sm] border border-border bg-surface px-2 py-1"
          />
        </label>
      </div>

      <Dialog
        open={pushOptInDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            onCancelEnable();
          }
        }}
        title="Push notifications rationale"
      >
        <p className="text-xs text-text">Enable push to receive mentions and messages when this tab is not active.</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-[--radius-sm] bg-accent px-3 py-1 text-xs text-accent-ink"
            onClick={onConfirmEnable}
            disabled={isSubmitting}
          >
            Allow notifications
          </button>
          <button
            type="button"
            className="rounded-[--radius-sm] border border-border px-3 py-1 text-xs text-text"
            onClick={onCancelEnable}
            disabled={isSubmitting}
          >
            Not now
          </button>
        </div>
      </Dialog>
    </section>
  );
}
