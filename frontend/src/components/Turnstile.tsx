"use client";

import { useEffect, useRef, useCallback } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function Turnstile({ onVerify, onError, onExpire, theme = "auto" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const renderedRef = useRef(false);

  // Store callbacks in refs so useEffect doesn't re-run when they change
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  onVerifyRef.current = onVerify;
  onErrorRef.current = onError;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!containerRef.current || renderedRef.current) return;

    const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
    if (!siteKey) {
      console.warn("Cloudflare Turnstile site key not configured");
      return;
    }

    const renderTurnstile = () => {
      if (!window.turnstile || !containerRef.current || renderedRef.current) return;

      renderedRef.current = true;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        callback: (token: string) => {
          onVerifyRef.current(token);
        },
        "error-callback": () => {
          onErrorRef.current?.();
        },
        "expired-callback": () => {
          onExpireRef.current?.();
        },
      });
    };

    // If turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderTurnstile();
    } else {
      // Otherwise wait for script to load
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          renderTurnstile();
        }
      }, 100);

      return () => clearInterval(checkTurnstile);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
          renderedRef.current = false;
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, [theme]);

  return <div ref={containerRef} className="cf-turnstile" />;
}
