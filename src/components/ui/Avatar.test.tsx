import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders fallback initials when src is not provided', () => {
    render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByLabelText('Ada Lovelace avatar')).toHaveTextContent('AL');
  });

  it('uses English alt text when image src is provided', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);

    expect(screen.getByRole('img', { name: 'Ada Lovelace avatar' })).toBeInTheDocument();
  });
});
