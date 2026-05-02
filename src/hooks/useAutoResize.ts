import { useLayoutEffect, type RefObject } from 'react';

export function useAutoResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight?: number
): void {
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    const nextHeight = textarea.scrollHeight;

    if (typeof maxHeight === 'number' && nextHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
      return;
    }

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = 'hidden';
  }, [maxHeight, textareaRef, value]);
}
