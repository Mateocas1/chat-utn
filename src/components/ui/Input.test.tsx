import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders with a label and associates it to the input', () => {
    render(<Input label="Email" id="email" placeholder="tu@email.com" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id', 'email');
    expect(input).toHaveAttribute('placeholder', 'tu@email.com');
  });

  it('renders helper text when provided', () => {
    render(<Input label="Nombre" id="name" helperText="Sin apodos" />);

    expect(screen.getByText('Sin apodos')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <Input
        label="Password"
        id="password"
        error="Minimo 8 caracteres"
      />,
    );

    const input = screen.getByLabelText('Password');
    expect(screen.getByText('Minimo 8 caracteres')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the input when disabled', () => {
    render(<Input label="Nombre" id="nombre" disabled />);

    const input = screen.getByLabelText('Nombre');
    expect(input).toBeDisabled();
  });
});
