import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders title, content, and optional footer regions', () => {
    render(
      <AuthLayout title="Iniciar sesión" footer={<a href="/register">Crear cuenta</a>}>
        <form aria-label="login form">contenido</form>
      </AuthLayout>,
    );

    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'login form' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('omits footer when not provided', () => {
    render(
      <AuthLayout title="Crear cuenta">
        <div>form</div>
      </AuthLayout>,
    );

    expect(screen.queryByRole('contentinfo')).toBeNull();
  });
});
