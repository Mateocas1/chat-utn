import { fireEvent, render, screen } from '@testing-library/react';
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

  it('renders a skip link targeting main content', () => {
    render(
      <AppShell>
        <div>Main</div>
      </AppShell>,
    );

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('marks main content as the skip link target', () => {
    render(
      <AppShell>
        <div>Main</div>
      </AppShell>,
    );

    const main = screen.getByText('Main').closest('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus to main content when skip link is activated', () => {
    render(
      <AppShell>
        <div>Main</div>
      </AppShell>,
    );

    const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
    const main = screen.getByText('Main').closest('main');

    if (!main) {
      throw new Error('Expected main element to exist');
    }

    skipLink.focus();
    fireEvent.click(skipLink);

    expect(document.activeElement).toBe(main);
  });
});
