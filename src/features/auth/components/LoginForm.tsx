import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { login } from '../api/auth';
import useAuthStore from '../store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type ErrorResponse = {
  message?: string;
};

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      if (response.success) {
        setAuth(response.data.token, response.data.user);
        navigate('/');
      }
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading ? 'true' : 'false'} noValidate>
      <p className="text-sm text-[--color-muted]">Completá tus credenciales para continuar.</p>
      {error ? (
        <div role="alert" className="rounded-[--radius-sm] border border-[--color-danger] bg-[--color-surface] p-3 text-sm text-[--color-danger]">
          {error}
        </div>
      ) : null}
      <Input
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
        aria-invalid={error ? 'true' : undefined}
      />
      <Input
        id="login-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={loading}
        aria-invalid={error ? 'true' : undefined}
      />
      <Button type="submit" variant="accent" disabled={loading} className="w-full">
        {loading ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>
    </form>
  );
};
