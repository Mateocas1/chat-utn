import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationTray, type NotificationTrayItem } from './NotificationTray';

const baseItems: NotificationTrayItem[] = [
  {
    id: 'n1',
    title: 'Connection unstable',
    message: 'Realtime updates are delayed',
    variant: 'status',
  },
  {
    id: 'n2',
    title: 'Message failed',
    message: 'Retry from the composer to send again',
    variant: 'warning',
  },
];

describe('NotificationTray', () => {
  it('does not render when hidden', () => {
    const { container } = render(<NotificationTray isVisible={false} items={baseItems} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when visible with no items', () => {
    const { container } = render(<NotificationTray isVisible items={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders one status item with content', () => {
    render(<NotificationTray isVisible items={[baseItems[0]]} />);

    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Connection unstable')).toBeInTheDocument();
    expect(screen.getByText('Realtime updates are delayed')).toBeInTheDocument();
  });

  it('renders multiple toast/status items', () => {
    render(<NotificationTray isVisible items={baseItems} />);

    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(2);
    expect(screen.getByText('Connection unstable')).toBeInTheDocument();
    expect(screen.getByText('Message failed')).toBeInTheDocument();
  });

  it('calls dismiss callback with item id', () => {
    const onDismiss = vi.fn();

    render(<NotificationTray isVisible items={baseItems} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Connection unstable' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('n1');
  });

  it('renders toasts with alert and status roles by variant', () => {
    render(
      <NotificationTray
        isVisible
        items={[
          { id: 'n1', title: 'Connection unstable', message: 'Realtime delayed', variant: 'status' },
          { id: 'n2', title: 'Message failed', message: 'Retry from composer', variant: 'error' },
        ]}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Connection unstable');
    expect(screen.getByRole('alert')).toHaveTextContent('Message failed');
  });

  it('renders dismiss button as keyboard reachable control', () => {
    render(<NotificationTray isVisible items={[baseItems[0]]} onDismiss={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Dismiss Connection unstable' })).toBeInTheDocument();
  });

  it('does not expose a live region on the tray container', () => {
    render(<NotificationTray isVisible items={[baseItems[0]]} />);

    expect(screen.getByLabelText('Notifications')).not.toHaveAttribute('aria-live');
  });

  it('uses subtle status-first industrial quiet treatment', () => {
    render(<NotificationTray isVisible items={[baseItems[0]]} />);

    const tray = screen.getByLabelText('Notifications');
    const statusChip = screen.getByLabelText('Notification status');

    expect(tray).toHaveClass('border-border');
    expect(tray).toHaveClass('bg-panel/80');
    expect(tray).toHaveClass('text-muted');
    expect(statusChip).toHaveClass('bg-accent/45');
  });
});
