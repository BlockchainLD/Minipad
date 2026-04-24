"use client";

import { useEffect, useState } from "react";
import { StandardButton } from "./ui/standard-button";

interface IdeaSubmissionConfirmationProps {
  onReturnHome: () => void;
}

export const IdeaSubmissionConfirmation = ({ onReturnHome }: IdeaSubmissionConfirmationProps) => {
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
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4" style={{ background: '#7c3aed', borderRadius: 16 }}>
            <svg width="36" height="50" viewBox="44 15 112 155" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 28 C76 28 57 47 57 71 C57 86 64.5 99 76 107.5 L76 134 L124 134 L124 107.5 C135.5 99 143 86 143 71 C143 47 124 28 100 28 Z" stroke="white" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="80" y1="144" x2="120" y2="144" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
              <line x1="86" y1="157" x2="114" y2="157" stroke="white" strokeWidth="7.5" strokeLinecap="round" />
              <line x1="100" y1="55" x2="100" y2="80" stroke="white" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Idea Submitted!
        </h1>

        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
          Your idea is live and ready for the community to vote on and claim.
        </p>

        <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-slate-900 mb-3">What happens next?</h3>
          <div className="space-y-2">
            {[
              "Community members can vote on your idea",
              "Developers can claim your idea to build it",
              "You can track progress and engage with builders",
            ].map((text, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-violet-600">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <StandardButton onClick={onReturnHome} variant="primary" fullWidth>
          Back to Ideas
        </StandardButton>

        <p className="text-xs text-slate-400 mt-4">
          Your idea is now part of the decentralized miniapp ecosystem on Base
        </p>
      </div>
    </div>
  );
};
