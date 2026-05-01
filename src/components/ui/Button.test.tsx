import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders label and defaults to type="button"', () => {
    render(<Button>Guardar</Button>);

    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('calls onClick when pressed', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enviar</Button>);

    const button = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Enviar
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Enviar' });
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets the data-variant attribute when provided', () => {
    render(<Button variant="accent">Accion</Button>);

    const button = screen.getByRole('button', { name: 'Accion' });
    expect(button).toHaveAttribute('data-variant', 'accent');
  });
});
