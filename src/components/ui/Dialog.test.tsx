import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  it('renders and closes when pressing escape', () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Permisos">
        Contenido
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Permisos' });
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('moves focus into the dialog and restores it on close', () => {
    const onOpenChange = vi.fn();

    const trigger = document.createElement('button');
    trigger.textContent = 'Open dialog';
    document.body.appendChild(trigger);
    trigger.focus();

    const triggerRef = { current: trigger };

    const { rerender } = render(
      <Dialog open onOpenChange={onOpenChange} title="Detalles" triggerRef={triggerRef}>
        <button type="button">Confirm</button>
      </Dialog>
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Confirm' }));

    rerender(
      <Dialog open={false} onOpenChange={onOpenChange} title="Detalles" triggerRef={triggerRef}>
        <button type="button">Confirm</button>
      </Dialog>
    );

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('falls back to focusing the dialog container when no focusables exist', () => {
    render(
      <Dialog open onOpenChange={vi.fn()} title="Sin controles">
        <p>Solo texto</p>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Sin controles' });
    expect(document.activeElement).toBe(dialog);
  });

  it('wires aria-labelledby to the title element', () => {
    render(
      <Dialog open onOpenChange={vi.fn()} title="Notificaciones">
        Contenido
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Notificaciones' });
    const title = screen.getByText('Notificaciones');

    expect(dialog).toHaveAttribute('aria-labelledby', title.getAttribute('id'));
  });

  it('wires aria-describedby when a description is provided', () => {
    render(
      <Dialog open onOpenChange={vi.fn()} title="Términos" description="Detalle legal">
        Contenido
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Términos' });
    const description = screen.getByText('Detalle legal');

    expect(dialog).toHaveAttribute('aria-describedby', description.getAttribute('id'));
  });

  it('omits aria-describedby when no description is provided', () => {
    render(
      <Dialog open onOpenChange={vi.fn()} title="Términos">
        Contenido
      </Dialog>
    );

    const dialog = screen.getByRole('dialog', { name: 'Términos' });

    expect(dialog).not.toHaveAttribute('aria-describedby');
  });
});
