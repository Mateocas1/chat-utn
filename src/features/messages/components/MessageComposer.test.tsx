import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MessageComposer } from './MessageComposer';

describe('MessageComposer', () => {
  it('renders text entry area', () => {
    render(<MessageComposer value="" onChange={vi.fn()} onSend={vi.fn()} />);

    expect(screen.getByLabelText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = vi.fn();

    render(<MessageComposer value="" onChange={onChange} onSend={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hola equipo' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Hola equipo');
  });

  it('calls onSend when pressing send button', () => {
    const onSend = vi.fn();

    render(<MessageComposer value="Mensaje listo" onChange={vi.fn()} onSend={onSend} />);

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('disables textarea and send action when disabled', () => {
    const onSend = vi.fn();

    render(<MessageComposer value="Mensaje" onChange={vi.fn()} onSend={onSend} disabled />);

    const textarea = screen.getByLabelText('Message');
    const sendButton = screen.getByRole('button', { name: 'Send message' });

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();

    fireEvent.click(sendButton);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables textarea and send action when submitting', () => {
    render(<MessageComposer value="Mensaje" onChange={vi.fn()} onSend={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText('Message')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('sends on Enter and inserts newline on Shift+Enter', () => {
    const onSend = vi.fn();

    render(<MessageComposer value="Linea" onChange={vi.fn()} onSend={onSend} />);

    const textarea = screen.getByLabelText('Message');

    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('does not send on Enter when value is blank', () => {
    const onSend = vi.fn();

    render(<MessageComposer value="   " onChange={vi.fn()} onSend={onSend} />);

    fireEvent.keyDown(screen.getByLabelText('Message'), { key: 'Enter' });

    expect(onSend).not.toHaveBeenCalled();
  });
});
