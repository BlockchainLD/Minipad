"use client";

import { useEffect, useState } from "react";
import { StandardButton } from "./ui/standard-button";

interface ClaimConfirmationProps {
  onReturnHome: () => void;
}

export const ClaimConfirmation = ({ onReturnHome }: ClaimConfirmationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`text-center transition-all duration-700 ${
          showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Minipad" width={80} height={80} className="inline-block mb-4" style={{ borderRadius: 16 }} />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Idea Claimed!
        </h1>

        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
          You&apos;ve committed to building this. The community is counting on you — time to ship.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
          <div className="space-y-2">
            {[
              "Build your miniapp and submit the live URL when ready",
              "The idea creator gets notified when you complete the build",
              "Top builders share in the prize pool each cycle",
            ].map((text, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://neynar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full"
          >
            <StandardButton variant="primary" fullWidth>
              Build with Neynar
            </StandardButton>
          </a>
          <StandardButton onClick={onReturnHome} variant="secondary" fullWidth>
            Back to Ideas
          </StandardButton>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Your claim is recorded on Base via EAS
        </p>
      </div>
    </div>
  );
};
