import { AuthLayout } from '@/components/layout/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Link } from 'react-router-dom';

export const LoginPage = () => {
  return (
    <AuthLayout
      title="Iniciar sesión"
      footer={
        <Link
          to="/register"
          className="font-medium text-[--color-accent] transition-colors hover:text-[--color-accent-2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] focus-visible:outline-offset-2"
        >
          ¿No tenés cuenta? Registrate
        </Link>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
};
