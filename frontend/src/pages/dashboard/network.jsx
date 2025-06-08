"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, ArrowUpRight, Copy, Check, Share2, Shield, Trophy, Zap, Coins, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import NetworkTree from "@/components/network/NetworkTree";
import { useNetworkStats, useNetworkLevels, useRecentReferrals, useGenealogyTree } from "@/hooks/dashboard/useDashboard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import toast from "react-hot-toast";
 
// --- Inline SVGs for farm/cocoa theme ---
const CocoaPod = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="12" ry="16" fill="#8B5C2A" stroke="#5C3310" strokeWidth="2" />
    <ellipse cx="16" cy="16" rx="8" ry="12" fill="#D2A86A" stroke="#8B5C2A" strokeWidth="1.5" />
    <ellipse cx="16" cy="16" rx="4" ry="8" fill="#F7E1B5" stroke="#D2A86A" strokeWidth="1" />
  </svg>
);
const FarmUser = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="6" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
    <ellipse cx="16" cy="24" rx="10" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
  </svg>
);
const FarmTree = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="24" rx="10" ry="6" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2" />
    <rect x="14" y="12" width="4" height="12" rx="2" fill="#C97C3A" />
    <ellipse cx="16" cy="12" rx="8" ry="8" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
  </svg>
);
const FarmCoin = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
    <ellipse cx="16" cy="16" rx="8" ry="8" fill="#FFF8DC" stroke="#FFD700" strokeWidth="1.5" />
    <path d="M12 16h8M16 12v8" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function NetworkPage() {
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("3d-tree");
  const [visualizationType, setVisualizationType] = useState("3d");

  // Use the custom hooks to fetch data
  const { data: networkStats, isLoading: isNetworkStatsLoading } = useNetworkStats();
  const { data: networkLevels, isLoading: isNetworkLevelsLoading } = useNetworkLevels();
  const { data: recentReferrals, isLoading: isRecentReferralsLoading } = useRecentReferrals();
  const { data: genealogyTree, isLoading: isGenealogyTreeLoading } = useGenealogyTree();

  console.log("Recent referrals",recentReferrals)
  // Fetch referral link
  const { data: referralLinkData } = useQuery({
    queryKey: ["referralLink"],
    queryFn: async () => {
      const response = await api.get("/network/referral-link");
      return response.data.data;
    },
  });

  // Determine overall loading state
  const isLoading =
    isNetworkStatsLoading || isNetworkLevelsLoading || isRecentReferralsLoading || isGenealogyTreeLoading;

  const handleCopyLink = () => {
    if (referralLinkData?.referralLink) {
      navigator.clipboard
        .writeText(referralLinkData.referralLink)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast.success("Link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Copy failed", err);
          toast.error("Failed to copy link.");
        });
    }
  };

  const handleShare = async () => {
    if (navigator.share && referralLinkData?.referralLink) {
      try {
        await navigator.share({
          title: "Join my network",
          text: "Join my network and start your journey to financial freedom!",
          url: referralLinkData.referralLink,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed", err);
          toast.error("Failed to share link.");
        }
      }
    } else {
      handleCopyLink();
    }
  };



  if (isLoading) {
    return (
      <div className="relative min-h-screen p-6 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] animate-pulse">
        <div className="h-12 w-3/4 bg-[#e6f2ef] rounded-lg mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-[#e6f2ef] rounded-xl"></div>
          ))}
        </div>
        <div className="h-[400px] bg-[#e6f2ef] rounded-xl mb-6"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[400px] bg-[#e6f2ef] rounded-xl"></div>
          <div className="h-[400px] bg-[#e6f2ef] rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] text-[#4e3b1f] overflow-hidden font-sans">
      {/* Immersive Cocoa Farm World Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg className="absolute left-0 top-0 w-40 h-40 opacity-10" viewBox="0 0 32 32">
          <ellipse cx="16" cy="16" rx="13" ry="8" fill="#C97C3A" />
          <ellipse cx="16" cy="16" rx="9" ry="5" fill="#8D6748" />
          <ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#FFE066" />
          <path d="M16 8C18 10 20 14 16 24" stroke="#8D6748" strokeWidth="1.5" />
          <path d="M16 8C14 10 12 14 16 24" stroke="#8D6748" strokeWidth="1.5" />
        </svg>
        <svg className="absolute right-0 bottom-0 w-48 h-48 opacity-10" viewBox="0 0 32 32">
          <rect x="6" y="14" width="20" height="12" rx="2" fill="#FFE066" stroke="#C97C3A" strokeWidth="2" />
          <rect x="13" y="20" width="6" height="6" rx="1" fill="#B6D7B0" />
          <path d="M4 16L16 6l12 10" stroke="#B6D7B0" strokeWidth="2" />
        </svg>
        <svg className="absolute left-1/2 -translate-x-1/2 bottom-10 w-32 h-32 opacity-5" viewBox="0 0 32 32">
          <ellipse cx="16" cy="20" rx="10" ry="5" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2" />
          <ellipse cx="16" cy="20" rx="5" ry="2.5" fill="#FFE066" stroke="#8D6748" strokeWidth="1.5" />
          <rect x="14" y="8" width="4" height="10" rx="2" fill="#C97C3A" />
        </svg>
        {/* Animated clouds */}
        <svg className="absolute top-10 left-1/4 w-32 h-12 animate-cloud-move" viewBox="0 0 100 40">
          <ellipse cx="30" cy="20" rx="30" ry="12" fill="#fffbe6" />
          <ellipse cx="60" cy="20" rx="20" ry="10" fill="#e6f2ef" />
        </svg>
        <svg className="absolute top-20 right-1/4 w-40 h-16 animate-cloud-move2" viewBox="0 0 120 50">
          <ellipse cx="50" cy="25" rx="40" ry="15" fill="#fffbe6" />
          <ellipse cx="90" cy="25" rx="25" ry="12" fill="#e6f2ef" />
        </svg>
      </div>
      <motion.div className="relative z-10 space-y-8" initial="hidden" animate="visible">
        {/* Header / Hero Section */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#8B5C2A] font-cursive flex items-center gap-2">
              <FarmTree className="w-8 h-8" />
              Cocoa Farm Network
            </h1>
            <p className="text-[#A67C52] mt-1 max-w-xl">
              Grow your cocoa farm by recruiting new farmers and nurturing your network. Each new member is a seedling—help them thrive and watch your farm flourish!
            </p>
          </div>
          <button
            onClick={() => setIsReferralModalOpen(true)}
            className="bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/80 hover:to-[#ffe066]/80 text-[#4e3b1f] font-bold rounded-xl px-6 py-3 shadow-lg border-2 border-[#b6d7b0]/40 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <FarmUser className="w-6 h-6" />
            Recruit a Farmer
          </button>
        </section>
        {/* Network Stats Section */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {networkStats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-2xl overflow-visible shadow-2xl flex flex-col items-center px-6 pt-12 pb-8 min-w-[160px] max-w-xs mx-auto group hover:scale-105 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.04 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                  {stat.icon === "UserPlus" ? <FarmUser className="w-8 h-8" /> : <CocoaPod className="w-8 h-8" />}
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-cursive text-[#A67C52]">{stat.title}</p>
                <p className="text-2xl font-extrabold text-[#4e3b1f] mt-1">{stat.value}</p>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#8d6748] rounded-b-xl shadow-inner border-t-4 border-[#b6d7b0]/30" />
            </motion.div>
          ))}
        </section>
        {/* Tab Navigation */}
        <section className="flex border-b border-[#b6d7b0]/40 mb-6">
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors",
              activeTab === "3d-tree"
                ? "text-[#8B5C2A] border-b-2 border-[#8B5C2A]"
                : "text-[#A67C52] hover:text-[#8B5C2A]",
            )}
            onClick={() => setActiveTab("3d-tree")}
          >
            Farm Network Map
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors",
              activeTab === "referrals"
                ? "text-[#8B5C2A] border-b-2 border-[#8B5C2A]"
                : "text-[#A67C52] hover:text-[#8B5C2A]",
            )}
            onClick={() => setActiveTab("referrals")}
          >
            Direct Referrals
          </button>
        </section>
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "3d-tree" && (
            <motion.div
              key="3d-tree"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Farm Network Visualization */}
              <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-3xl overflow-visible shadow-2xl p-8 pt-12 group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                    <FarmTree className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#C97C3A] font-cursive mb-5 flex items-center gap-3">
                    Network
                  </h2>
                  <div className="h-[700px] w-full">
                    {genealogyTree ? (
                      <NetworkTree networkData={genealogyTree} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-[#A67C52]">No network data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "referrals" && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Recent Referrals */}
              <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-3xl overflow-visible shadow-2xl p-8 pt-12 group hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                    <FarmUser className="w-8 h-8" />
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#C97C3A] font-cursive mb-5 flex items-center gap-3">
                    Direct Referrals
                  </h2>
                  {recentReferrals?.length > 0 ? (
                    <div className="space-y-6">
                      {recentReferrals.map((referral, index) => (
                        
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between border-b border-[#b6d7b0]/30 last:border-0 pb-4 last:pb-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#b6d7b0]/50 to-[#ffe066]/50 ring-1 ring-[#b6d7b0]/20 flex items-center justify-center">
                              <FarmUser className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="font-medium text-[#4e3b1f]">{referral.name}</p>
                              <p className="text-sm text-[#4e3b1f]">{referral.joinedAt}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#4e3b1f]">{referral.package}</p>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                referral.status === "active"
                                  ? "bg-green-900/30 text-green-700"
                                  : "bg-yellow-900/30 text-yellow-700",
                              )}
                            >
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-[#A67C52]">No recent referrals</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Referral Link Dialog */}
      <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#fffbe6] border border-[#b6d7b0] text-[#4e3b1f]">
          <DialogHeader>
            <DialogTitle className="text-[#8B5C2A]">Recruit a Farmer</DialogTitle>
            <DialogDescription className="text-[#A67C52]">
              Share your farm's referral link to grow your cocoa network and earn rewards
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={referralLinkData?.referralLink || "Your referral link"}
                className="font-mono text-sm bg-[#e6f2ef] border-[#b6d7b0] text-[#4e3b1f]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 border-2 border-[#b6d7b0] bg-[#fffbe6] hover:bg-[#e6f2ef] text-[#4e3b1f] rounded-lg p-2 transition"
              >
                {copied ? <span className="text-green-600 font-bold">✓</span> : <span className="font-bold">Copy</span>}
                <span className="sr-only">Copy link</span>
              </button>
            </div>
            <div className="bg-[#b6d7b0]/30 border border-[#b6d7b0]/50 rounded-lg p-4 text-sm">
              <p className="text-[#059669] flex items-center gap-2">
                <FarmCoin className="h-4 w-4" />
                Recruitment Bonus
              </p>
              <p className="mt-1 text-[#4e3b1f]">
                For each new farmer that joins with your link, you'll earn 35% commission on their plan purchase.
              </p>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <button
              type="button"
              className="w-full bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/80 hover:to-[#ffe066]/80 text-[#4e3b1f] font-bold rounded-xl px-6 py-3 shadow-lg border-2 border-[#b6d7b0]/40 flex items-center gap-2 justify-center transition-transform hover:scale-105"
              onClick={handleShare}
            >
              <FarmUser className="mr-2 h-5 w-5" />
              Share Link
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style>{`
        @keyframes cloud-move { 0%{transform:translateX(0);} 100%{transform:translateX(60vw);} }
        @keyframes cloud-move2 { 0%{transform:translateX(0);} 100%{transform:translateX(40vw);} }
        .animate-cloud-move { animation: cloud-move 60s linear infinite; }
        .animate-cloud-move2 { animation: cloud-move2 80s linear infinite; }
      `}</style>
    </div>
  );
}
