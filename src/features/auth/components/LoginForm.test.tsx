import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosError } from 'axios';
import { LoginForm } from './LoginForm';
import { login } from '../api/auth';

const navigateMock = vi.fn();
const setAuthMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../api/auth', () => ({
  login: vi.fn()
}));

vi.mock('../store/authStore', () => ({
  default: (selector: (state: { setAuth: typeof setAuthMock }) => unknown) => selector({ setAuth: setAuthMock })
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accessible fields and submit state', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
    expect(screen.getByText('Completá tus credenciales para continuar.')).toBeInTheDocument();
  });

  it('submits and redirects on successful login', async () => {
    vi.mocked(login).mockResolvedValue({
      success: true,
      data: {
        token: 'token-123',
        user: { id: 'u1', displayName: 'Ada' }
      }
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'Password123!' });
    });

    expect(setAuthMock).toHaveBeenCalledWith('token-123', { id: 'u1', displayName: 'Ada' });
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  it('shows loading and handles api errors with alert semantics', async () => {
    vi.mocked(login).mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject({ response: { data: { message: 'Credenciales inválidas' } } } as AxiosError), 0))
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'bad-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDisabled();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Credenciales inválidas');
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
    });
  });
});
