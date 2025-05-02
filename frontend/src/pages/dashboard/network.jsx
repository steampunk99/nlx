"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Helper function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case "commission":
        return Coins;
      case "network":
        return Users;
      default:
        return Activity;
    }
  };

  // Helper function to get activity color
  const getActivityColor = (type) => {
    switch (type) {
      case "commission":
        return {
          bg: "bg-green-900/30",
          text: "text-green-400",
          ring: "ring-green-400/20",
        };
      case "network":
        return {
          bg: "bg-blue-900/30",
          text: "text-blue-400",
          ring: "ring-blue-400/20",
        };
      default:
        return {
          bg: "bg-yellow-900/30",
          text: "text-yellow-400",
          ring: "ring-yellow-400/20",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 w-3/4 bg-gray-800 rounded-lg"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-[400px] bg-gray-800 rounded-xl"></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[400px] bg-gray-800 rounded-xl"></div>
          <div className="h-[400px] bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Network Quest</h1>
            <p className="text-gray-400">Build and expand your alliance of adventurers</p>
          </div>
          <Button
            onClick={() => setIsReferralModalOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Recruit New Allies
          </Button>
        </div>

        {/* Network Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {networkStats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bgColor)}>
                    {stat.icon === "UserPlus" ? (
                      <UserPlus className={`h-6 w-6 ${stat.iconColor}`} />
                    ) : (
                      <Users className={`h-6 w-6 ${stat.iconColor}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className={`w-3 h-3 mr-1 ${stat.color}`} />
                      <span className={`text-xs ${stat.color}`}>{stat.trend}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="h-1 w-full bg-gradient-to-r"
                style={{
                  backgroundImage: `linear-gradient(to right, ${stat.color.replace("text-", "rgb(")}, ${stat.color.replace("text-", "rgba(").replace(")", ", 0.5)")})`,
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors",
              activeTab === "3d-tree"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-gray-300",
            )}
            onClick={() => setActiveTab("3d-tree")}
          >
            3D Network Map
          </button>
      
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors",
              activeTab === "levels"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-gray-300",
            )}
            onClick={() => setActiveTab("levels")}
          >
            Network Levels
          </button>
          <button
            className={cn(
              "px-4 py-2 font-medium text-sm transition-colors",
              activeTab === "referrals"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-gray-400 hover:text-gray-300",
            )}
            onClick={() => setActiveTab("referrals")}
          >
            Recent Recruits
          </button>
        </div>

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
              {/* 3D Network Visualization */}
              <Card className="overflow-hidden border-none bg-gradient-to-br from-gray-900 to-gray-800">
                <CardHeader className="border-b border-gray-700">
                  <CardTitle className="text-xl text-white">3D Alliance Map</CardTitle>
                  <CardDescription className="text-gray-400">
                    Interactive 3D view of your network structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[700px] w-full">
                    {genealogyTree ? (
                      <NetworkTree networkData={genealogyTree} />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-400">No network data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "tree" && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 2D Network Visualization - Using same NetworkTree component */}
          
            </motion.div>
          )}

          {activeTab === "levels" && (
            <motion.div
              key="levels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Network Levels */}
              <Card className="bg-gray-800/60 border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Network Levels</CardTitle>
                  <CardDescription className="text-gray-400">Breakdown of your network by levels</CardDescription>
                </CardHeader>
                <CardContent>
                  {networkLevels?.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-lg border border-gray-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700 bg-gray-900/50">
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                              Level
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                              Members
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                              Active
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                              Progress
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {networkLevels.map((level) => (
                            <tr key={level.level} className="bg-gray-800 hover:bg-gray-700 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center">
                                  <Shield className="w-4 h-4 mr-2 text-indigo-400" />
                                  Level {level.level}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-300">{level.members}</td>
                              <td className="px-6 py-4 text-gray-300">{level.active}</td>
                              <td className="px-6 py-4">
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className="bg-indigo-600 h-2.5 rounded-full"
                                    style={{ width: `${(level.active / level.members) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 mt-1">
                                  {Math.round((level.active / level.members) * 100)}% active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-gray-400">No network levels data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
              <Card className="bg-gray-800/60 border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Recruits</CardTitle>
                  <CardDescription className="text-gray-400">Latest members who joined your network</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentReferrals?.length > 0 ? (
                    <div className="space-y-6">
                      {recentReferrals.map((referral, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between border-b border-gray-700 last:border-0 pb-4 last:pb-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 ring-1 ring-white/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{referral.name}</p>
                              <p className="text-sm text-gray-400">{referral.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-indigo-400">{referral.package}</p>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                referral.status === "active"
                                  ? "bg-green-900/30 text-green-400"
                                  : "bg-yellow-900/30 text-yellow-400",
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
                      <p className="text-gray-400">No recent referrals</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Referral Link Dialog */}
      <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 border border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Recruit New Allies</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share your referral link to grow your network and earn rewards
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
              <Input
                readOnly
                value={referralLinkData?.referralLink || "Your referral link"}
                className="font-mono text-sm bg-gray-900 border-gray-700 text-gray-300"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
                className="shrink-0 border-gray-700 bg-gray-900 hover:bg-gray-800 text-gray-300"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>

            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-4 text-sm">
              <p className="text-indigo-300 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-indigo-400" />
                Recruitment Bonus
              </p>
              <p className="mt-1 text-gray-300">
                For each new ally that joins with your link, you'll earn 40% commission on their package purchase.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
