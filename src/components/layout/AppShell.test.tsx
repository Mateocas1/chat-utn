import { render, screen } from '@testing-library/react';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders structural regions when provided', () => {
    render(
      <AppShell
        header={<div>Header</div>}
        sidebar={<nav>Side</nav>}
        footer={<div>Footer</div>}
      >
        <div>Main</div>
      </AppShell>,
    );

    expect(screen.getByText('Header').closest('header')).toBeTruthy();
    expect(screen.getByText('Side').closest('aside')).toBeTruthy();
    expect(screen.getByText('Main').closest('main')).toBeTruthy();
    expect(screen.getByText('Footer').closest('footer')).toBeTruthy();
  });

  it('omits optional regions when not provided', () => {
    render(
      <AppShell>
        <div>Main</div>
      </AppShell>,
    );

    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
    expect(screen.getByText('Main').closest('main')).toBeTruthy();
  });
});
