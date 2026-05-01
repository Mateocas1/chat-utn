import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders fallback initials when src is not provided', () => {
    render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByLabelText('Avatar de Ada Lovelace')).toHaveTextContent('AL');
  });
});
