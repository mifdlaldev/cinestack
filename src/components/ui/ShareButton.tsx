"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  variant = "icon",
  className = "",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareUrl =
    url ?? (typeof window !== "undefined" ? window.location.href : "");

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 2500);
  }, []);

  const handleShare = useCallback(async () => {
    // Clear any existing toast timer before triggering a new one
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        showToast("Link copied to clipboard");
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        showToast("Could not copy link");
      }
    }
  }, [title, text, shareUrl, showToast]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.97]";

  const styleClasses =
    variant === "icon"
      ? "h-9 w-9 rounded-full border border-border text-text-secondary hover:bg-surface hover:text-text"
      : "border border-border px-4 py-2 text-text-secondary hover:bg-surface hover:text-text";

  return (
    <>
      <button
        onClick={handleShare}
        className={`${baseClasses} ${styleClasses} ${className}`}
        aria-label={copied ? "Link copied" : "Share"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-accent" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {variant === "button" && (copied ? "Copied" : "Share")}
      </button>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-bg shadow-lg"
          role="status"
          aria-live="polite"
          style={{
            animation: "toastIn 0.3s ease-out",
          }}
        >
          {toast}
        </div>
      )}

      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
