"use client";

import { useState } from "react";
import Turnstile from "react-turnstile";

interface CaptchaWidgetProps {
  /** Called with the turnstile token when solved. */
  onToken: (token: string | null) => void;
  /** Reset counter to force a new challenge. Increment to reset. */
  resetKey?: number;
}

export function CaptchaWidget({ onToken, resetKey }: CaptchaWidgetProps) {
  const [widgetReady, setWidgetReady] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Graceful fallback: skip CAPTCHA when no keys are configured
  if (!siteKey) return null;

  return (
    <div className="flex justify-center">
      <Turnstile
        sitekey={siteKey}
        onVerify={(token) => {
          onToken(token);
          setWidgetReady(true);
        }}
        onError={() => {
          onToken(null);
          setWidgetReady(false);
        }}
        onExpire={() => {
          onToken(null);
          setWidgetReady(false);
        }}
        refreshExpired="auto"
        fixedSize
        className="scale-[0.85] origin-center"
        key={resetKey}
      />
    </div>
  );
}
