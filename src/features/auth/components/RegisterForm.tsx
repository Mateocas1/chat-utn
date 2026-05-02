import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { register } from '../api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type ErrorResponse = {
  message?: string;
};

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register({ email, displayName, password });
      if (response.success) {
        navigate('/login');
      }
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      setError(axiosError.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading ? 'true' : 'false'} noValidate>
      {error ? (
        <div role="alert" className="rounded-[--radius-sm] border border-[--color-danger] bg-[--color-surface] p-3 text-sm text-[--color-danger]">
          {error}
        </div>
      ) : null}
      <Input
        id="register-name"
        label="Nombre"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        autoComplete="name"
        required
        disabled={loading}
        aria-invalid={error ? 'true' : undefined}
      />
      <Input
        id="register-email"
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
        id="register-password"
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
        required
        minLength={8}
        disabled={loading}
        aria-invalid={error ? 'true' : undefined}
        helperText="La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial."
      />
      <Button type="submit" variant="accent" disabled={loading} className="w-full">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
};
