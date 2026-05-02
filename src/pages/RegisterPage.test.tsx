import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';

vi.mock('@/features/auth/components/RegisterForm', () => ({
  RegisterForm: () => <div data-testid="register-form">RegisterForm</div>,
}));

describe('RegisterPage', () => {
  it('uses AuthLayout with register title and footer link', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '¿Ya tenés cuenta? Iniciá sesión' })).toHaveAttribute('href', '/login');
  });
});
