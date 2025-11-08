"use client";

import { useEffect, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";

interface IdeaSubmissionConfirmationProps {
  onReturnHome: () => void;
}

export const IdeaSubmissionConfirmation = ({ 
  onReturnHome
}: IdeaSubmissionConfirmationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className={`text-center transition-all duration-700 ${
        showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        {/* Success Icon with Animation */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Idea Submitted Successfully!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          Your idea has been submitted and attested to the blockchain. 
          It&apos;s now live and ready for the community to vote on and claim!
        </p>


        {/* What's Next Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3 text-left">What happens next?</h3>
          <div className="space-y-2 text-left">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-gray-700">Community members can vote on your idea</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-gray-700">Developers can claim your idea to build it</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-gray-700">You can track progress and engage with builders</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onReturnHome}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Return to Ideas Board
        </Button>

        {/* Additional Info */}
        <p className="text-xs text-gray-500 mt-4">
          Your idea is now part of the decentralized miniapp ecosystem on Base
        </p>
      </div>
    </div>
  );
};
