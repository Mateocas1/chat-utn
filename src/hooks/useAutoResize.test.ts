import { createElement, useEffect, useLayoutEffect, useRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAutoResize } from './useAutoResize';

interface AutoResizeHarnessProps {
  value: string;
  maxHeight?: number;
}

function AutoResizeHarness({ value, maxHeight }: AutoResizeHarnessProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    textareaRef.current = document.querySelector<HTMLTextAreaElement>('[data-testid="auto-resize-textarea"]');
  }, []);

  useAutoResize(textareaRef, value, maxHeight);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [textareaRef]);

  return createElement('textarea', {
    'data-testid': 'auto-resize-textarea',
    value,
    onChange: () => undefined,
  });
}

describe('useAutoResize', () => {
  it('updates textarea height when value changes', () => {
    const { container, rerender } = render(createElement(AutoResizeHarness, { value: '' }));
    const textarea = container.querySelector('textarea');

    if (!textarea) {
      throw new Error('Expected textarea to exist');
    }

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 120,
    });

    rerender(createElement(AutoResizeHarness, { value: 'line 1\nline 2' }));

    expect(textarea.style.height).toBe('120px');
  });

  it('respects max-height constraint and enables overflow scrolling', () => {
    const { container, rerender } = render(createElement(AutoResizeHarness, { value: '', maxHeight: 140 }));
    const textarea = container.querySelector('textarea');

    if (!textarea) {
      throw new Error('Expected textarea to exist');
    }

    Object.defineProperty(textarea, 'scrollHeight', {
      configurable: true,
      value: 260,
    });

    rerender(createElement(AutoResizeHarness, { value: 'line 1\nline 2\nline 3\nline 4', maxHeight: 140 }));

    expect(textarea.style.height).toBe('140px');
    expect(textarea.style.overflowY).toBe('auto');
  });
});
