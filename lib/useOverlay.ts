'use client';

import { useEffect, useRef, useState } from 'react';

const CLOSE_TRANSITION_MS = 500;

export function useOverlay() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: '50%', y: '50%' });

  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openAt(originValue: { x: string; y: string }) {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    setOrigin(originValue);
    setShown(true);
  }

  function close() {
    setOpen(false);
    lastFocusedRef.current?.focus();
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setShown(false), CLOSE_TRANSITION_MS);
  }

  useEffect(() => {
    if (!shown) return;
    closeRef.current?.focus();
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, [shown]);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    },
    []
  );

  return { shown, open, origin, closeRef, openAt, close };
}
