import { AuthLayout } from '@/components/layout/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';

export const RegisterPage = () => {
  return (
    <AuthLayout
      title="Crear cuenta"
      footer={
        <Link
          to="/login"
          className="font-medium text-[--color-accent] transition-colors hover:text-[--color-accent-2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-accent] focus-visible:outline-offset-2"
        >
          ¿Ya tenés cuenta? Iniciá sesión
        </Link>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
};
