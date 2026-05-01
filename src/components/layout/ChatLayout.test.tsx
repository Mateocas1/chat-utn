import { render, screen } from '@testing-library/react';
import { ChatLayout } from './ChatLayout';

describe('ChatLayout', () => {
  it('renders sidebar and main regions with semantic containers', () => {
    render(
      <ChatLayout sidebar={<div>Sidebar</div>} main={<div>Main</div>} />,
    );

    expect(screen.getByText('Sidebar').closest('aside')).toBeTruthy();
    expect(screen.getByText('Main').closest('main')).toBeTruthy();
  });

  it('renders optional secondary pane when provided', () => {
    render(
      <ChatLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Main</div>}
        secondary={<div>Secondary</div>}
      />,
    );

    expect(screen.getByText('Secondary').closest('section')).toBeTruthy();
  });

  it('applies responsive two-to-three pane class structure', () => {
    render(
      <ChatLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Main</div>}
        secondary={<div>Secondary</div>}
      />,
    );

    const root = screen.getByTestId('chat-layout');
    expect(root.className).toContain('grid');
    expect(root.className).toContain('grid-cols-1');
    expect(root.className).toContain('md:grid-cols-[20rem_minmax(0,1fr)]');
    expect(root.className).toContain('xl:grid-cols-[20rem_minmax(0,1fr)_22rem]');
  });

  it('hides secondary pane on smaller breakpoints via class structure', () => {
    render(
      <ChatLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Main</div>}
        secondary={<div>Secondary</div>}
      />,
    );

    const secondaryRegion = screen.getByTestId('chat-layout-secondary');
    expect(secondaryRegion.className).toContain('hidden');
    expect(secondaryRegion.className).toContain('xl:block');
  });
});
