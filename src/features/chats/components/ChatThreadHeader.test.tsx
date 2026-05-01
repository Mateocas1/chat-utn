import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChatThreadHeader } from './ChatThreadHeader';

describe('ChatThreadHeader', () => {
  it('renders chat title', () => {
    render(<ChatThreadHeader title="Arquitectura Frontend" />);

    expect(screen.getByRole('heading', { name: 'Arquitectura Frontend' })).toBeInTheDocument();
  });

  it('renders subtitle metadata when provided', () => {
    render(
      <ChatThreadHeader
        title="Arquitectura Frontend"
        subtitle="8 participantes · ultimo mensaje hace 2m"
      />,
    );

    expect(screen.getByText('8 participantes · ultimo mensaje hace 2m')).toBeInTheDocument();
  });

  it('renders presence status when provided', () => {
    render(
      <ChatThreadHeader
        title="Arquitectura Frontend"
        status="En linea"
      />,
    );

    expect(screen.getByLabelText('Estado de presencia')).toHaveTextContent('En linea');
  });

  it('renders actions area when actions are provided', () => {
    render(
      <ChatThreadHeader
        title="Arquitectura Frontend"
        actions={<button type="button">Ver info</button>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Ver info' })).toBeInTheDocument();
  });

  it('does not render optional sections when not provided', () => {
    render(<ChatThreadHeader title="Arquitectura Frontend" />);

    expect(screen.queryByLabelText('Estado de presencia')).toBeNull();
    expect(screen.queryByTestId('chat-thread-header-actions')).toBeNull();
  });
});
