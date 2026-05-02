import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosError } from 'axios';
import { RegisterForm } from './RegisterForm';
import { register } from '../api/auth';

const navigateMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../api/auth', () => ({
  register: vi.fn()
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accessible registration fields and helper copy', () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText('Nombre')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('submits and navigates to login when registration succeeds', async () => {
    vi.mocked(register).mockResolvedValue({
      success: true,
      data: {
        token: 'token-123',
        user: { id: 'u1', displayName: 'Ada' }
      }
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        displayName: 'Ada',
        email: 'ada@example.com',
        password: 'Password123!'
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('shows loading and accessible error state on api failure', async () => {
    vi.mocked(register).mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject({ response: { data: { message: 'Email en uso' } } } as AxiosError), 0))
    );

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email en uso');
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
    });
  });
});
