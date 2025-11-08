import { Button, Typography, Chip } from "@worldcoin/mini-apps-ui-kit-react";
import { Copy, LogOut, CheckCircle, Wallet, Network, CreditCard, User, LightBulb, Hammer, Tools } from "iconoir-react";
import { BasePay } from "../base-pay";
import { FarcasterProfile } from "../farcaster-profile";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAccount } from "wagmi";
import { StatusBadge } from "../ui/status-badge";

interface SettingsContentProps {
  walletAddress: string;
  copied: boolean;
  onCopyAddress: () => void;
  onSignOut: () => void;
  userId?: string;
  copiedUserId: boolean;
  onCopyUserId: () => void;
}

export const SettingsContent = ({ walletAddress, copied, onCopyAddress, onSignOut, userId, copiedUserId, onCopyUserId }: SettingsContentProps) => {
  const { address } = useAccount();
  
  // Fetch user's ideas
  const submittedIdeas = useQuery(api.userIdeas.getUserSubmittedIdeas, 
    address ? { author: address } : "skip"
  );
  const claimedIdeas = useQuery(api.userIdeas.getUserClaimedIdeas, 
    address ? { claimer: address } : "skip"
  );
  const completedIdeas = useQuery(api.userIdeas.getUserCompletedIdeas, 
    address ? { claimer: address } : "skip"
  );
  
  return (
    <div className="space-y-6">
      <FarcasterProfile />
      
      {/* User's Ideas Section */}
      <div className="space-y-4">
        <Typography variant="subtitle" className="text-black">
          Your Ideas
        </Typography>
        
        {/* Submitted Ideas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <LightBulb width={20} height={20} className="text-blue-600" />
            <Typography variant="label" className="text-black font-semibold">
              Submitted ({submittedIdeas?.length || 0})
            </Typography>
          </div>
          {submittedIdeas && submittedIdeas.length > 0 ? (
            <div className="space-y-2">
              {submittedIdeas.slice(0, 3).map((idea: any) => (
                <div key={idea._id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{idea.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                    </div>
                    <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
                  </div>
                </div>
              ))}
              {submittedIdeas.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{submittedIdeas.length - 3} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No ideas submitted yet</p>
          )}
        </div>
        
        {/* Claimed Ideas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hammer width={20} height={20} className="text-yellow-600" />
            <Typography variant="label" className="text-black font-semibold">
              Claimed ({claimedIdeas?.length || 0})
            </Typography>
          </div>
          {claimedIdeas && claimedIdeas.length > 0 ? (
            <div className="space-y-2">
              {claimedIdeas.slice(0, 3).map((idea: any) => (
                <div key={idea._id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{idea.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                    </div>
                    <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
                  </div>
                </div>
              ))}
              {claimedIdeas.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{claimedIdeas.length - 3} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No ideas claimed yet</p>
          )}
        </div>
        
        {/* Completed/Deployed Ideas */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tools width={20} height={20} className="text-green-600" />
            <Typography variant="label" className="text-black font-semibold">
              Deployed ({completedIdeas?.length || 0})
            </Typography>
          </div>
          {completedIdeas && completedIdeas.length > 0 ? (
            <div className="space-y-2">
              {completedIdeas.slice(0, 3).map((idea: any) => (
                <div key={idea._id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{idea.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{idea.description}</p>
                      {idea.deploymentUrl && (
                        <a 
                          href={idea.deploymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          View Deployment →
                        </a>
                      )}
                    </div>
                    <StatusBadge status={idea.status} className="px-2 py-0.5 text-xs flex-shrink-0" />
                  </div>
                </div>
              ))}
              {completedIdeas.length > 3 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  +{completedIdeas.length - 3} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No ideas deployed yet</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="space-y-1">
          <Typography variant="subtitle" className="text-black mb-4">
            Wallet Details
          </Typography>
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Wallet width={20} height={20} className="text-gray-600" />
              <div className="flex-1 min-w-0">
                <Typography variant="label" className="text-black">Wallet Address</Typography>
                <div className="overflow-x-scroll scrollbar-hide">
                  <Typography variant="body" className="text-gray-600 whitespace-nowrap">
                    {walletAddress || 'Loading...'}
                  </Typography>
                </div>
              </div>
            </div>
            <button
              onClick={onCopyAddress}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copied ? <CheckCircle width={16} height={16} /> : <Copy width={16} height={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <User width={20} height={20} className="text-gray-600" />
              <div className="flex-1 min-w-0">
                <Typography variant="label" className="text-black">Convex User ID</Typography>
                <div className="overflow-x-scroll scrollbar-hide">
                  <Typography variant="body" className="text-gray-600 whitespace-nowrap">
                    {userId || 'Loading...'}
                  </Typography>
                </div>
              </div>
            </div>
            <button
              onClick={onCopyUserId}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {copiedUserId ? <CheckCircle width={16} height={16} /> : <Copy width={16} height={16} />}
            </button>
          </div>   
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Network width={20} height={20} className="text-gray-600" />
              <div>
                <Typography variant="label" className="text-black">Network</Typography>
                <Typography variant="body" className="text-gray-600">Base Mainnet</Typography>
              </div>
            </div>
            <Chip label="Chain ID: 8453" variant="important" />
          </div>
          <div className="flex items-start space-x-3">
            <CreditCard width={20} height={20} className="text-gray-600 mt-0.5" />
            <div className="flex-1">
              <Typography variant="label" className="text-black mb-3 block">Test Payment</Typography>
              <div className="mt-2">
                <BasePay />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start space-x-3 pt-5">
              <Button
              variant="secondary"
              fullWidth
              onClick={onSignOut}
              className="!bg-red-500 !text-white hover:!bg-red-600 flex items-center justify-center space-x-2"
            >
              <LogOut width={20} height={20} />
              <span>Sign Out</span>
            </Button>
        </div>
        </div>
      </div>
    </div>
  );
};
