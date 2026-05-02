import { createElement, createRef, type RefObject } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

interface FocusTrapHarnessProps {
  active: boolean;
  withFocusable?: boolean;
  withInitialFocus?: boolean;
  triggerRef?: RefObject<HTMLElement | null>;
}

function FocusTrapHarness({
  active,
  withFocusable = true,
  withInitialFocus = false,
  triggerRef,
}: FocusTrapHarnessProps) {
  const containerRef = createRef<HTMLDivElement>();
  const initialFocusRef = createRef<HTMLButtonElement>();

  useFocusTrap(containerRef, {
    active,
    triggerRef,
    initialFocusRef: withInitialFocus ? initialFocusRef : undefined,
  });

  return createElement(
    'div',
    { ref: containerRef, role: 'dialog', 'aria-modal': true, tabIndex: -1 },
    withInitialFocus ? createElement('button', { ref: initialFocusRef }, 'Initial action') : null,
    withFocusable
      ? [
          createElement('button', { key: 'first' }, 'First'),
          createElement('button', { key: 'second' }, 'Second'),
        ]
      : null
  );
}

describe('useFocusTrap', () => {
  it('moves focus to the first focusable element on mount', () => {
    const { getByRole } = render(createElement(FocusTrapHarness, { active: true }));

    const firstButton = getByRole('button', { name: 'First' });
    expect(document.activeElement).toBe(firstButton);
  });

  it('uses initialFocusRef when provided', () => {
    const { getByRole } = render(createElement(FocusTrapHarness, { active: true, withInitialFocus: true }));

    const initialButton = getByRole('button', { name: 'Initial action' });
    expect(document.activeElement).toBe(initialButton);
  });

  it('restores focus to trigger element on unmount', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'Open dialog';
    document.body.appendChild(trigger);
    trigger.focus();

    const triggerRef = { current: trigger };
    const { unmount } = render(createElement(FocusTrapHarness, { active: true, triggerRef }));

    unmount();
    expect(document.activeElement).toBe(trigger);

    trigger.remove();
  });

  it('cycles focus with Tab and Shift+Tab inside the container', () => {
    const { getByRole } = render(createElement(FocusTrapHarness, { active: true }));

    const firstButton = getByRole('button', { name: 'First' });
    const secondButton = getByRole('button', { name: 'Second' });

    secondButton.focus();
    fireEvent.keyDown(secondButton, { key: 'Tab' });
    expect(document.activeElement).toBe(firstButton);

    firstButton.focus();
    fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(secondButton);
  });

  it('focuses container when no focusable descendants exist', () => {
    const { getByRole } = render(createElement(FocusTrapHarness, { active: true, withFocusable: false }));

    const dialog = getByRole('dialog');
    expect(document.activeElement).toBe(dialog);
  });
});
