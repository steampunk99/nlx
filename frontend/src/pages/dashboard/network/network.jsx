import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  UserPlus,
  TrendingUp,
  Shield,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  Trophy,
  Network as NetworkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NetworkGraph from "@/components/network/NetworkGraph"
import { useNetwork } from "@/hooks/network/useNetwork"
import { useAuth } from "@/hooks/auth/useAuth"
import { toast } from "react-hot-toast"
import { cn } from "@/lib/utils"

export default function NetworkPage() {
  const { user } = useAuth()
  const [selectedUser, setSelectedUser] = useState(null)
  const [showBonusReward, setShowBonusReward] = useState(false)
  const [networkLevel, setNetworkLevel] = useState(1)
  
  const { networkData, isLoading, refetch } = useNetwork()

  // Transform network data for 3D visualization
  const transformedData = networkData ? {
    id: user.id,
    name: user.username,
    children: networkData.directReferrals.map(referral => ({
      id: referral.id,
      name: referral.username,
      children: referral.referrals?.map(subReferral => ({
        id: subReferral.id,
        name: subReferral.username
      }))
    }))
  } : null

  // Handle node click in 3D visualization
  const handleNodeClick = (node) => {
    setSelectedUser(node)
    toast.success(`Selected user: ${node.name}`)
  }

  return (
    <div className="relative min-h-screen p-6 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,#1a103b,transparent)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Network Matrix
            </h1>
            <p className="text-cyan-300/80">Visualize and manage your network hierarchy</p>
          </div>
          <Button
            onClick={() => window.navigator.clipboard.writeText(user?.referralLink)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 border-none"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Share Referral Link
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Network Size */}
          <motion.div
            className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-300/80">Network Size</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {networkData?.networkSize || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-cyan-500/10 pt-4">
                <span className="text-sm text-cyan-300/60">Total Members</span>
                <div className="flex items-center text-cyan-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Level {networkLevel}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Direct Referrals */}
          <motion.div
            className="bg-black/40 backdrop-blur-sm border border-pink-500/20 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-pink-300/80">Direct Referrals</p>
                  <p className="text-2xl font-bold text-pink-400">
                    {networkData?.directReferrals?.length || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-pink-500/10 pt-4">
                <span className="text-sm text-pink-300/60">Active Members</span>
                <div className="flex items-center text-pink-400">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {networkData?.activeDirectReferrals || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Network Earnings */}
          <motion.div
            className="bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-300/80">Network Earnings</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {networkData?.networkEarnings || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-purple-500/10 pt-4">
                <span className="text-sm text-purple-300/60">Total Revenue</span>
                <div className="flex items-center text-purple-400">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {networkData?.earningsGrowth || 0}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Network Level */}
          <motion.div
            className="bg-black/40 backdrop-blur-sm border border-yellow-500/20 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <NetworkIcon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-300/80">Network Level</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {networkData?.networkLevel || 1}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-yellow-500/10 pt-4">
                <span className="text-sm text-yellow-300/60">Next Level</span>
                <div className="flex items-center text-yellow-400">
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {networkData?.nextLevelRequirement || 0} members
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Network Visualization */}
        <motion.div
          className="bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <NetworkIcon className="w-5 h-5 mr-2 text-cyan-400" />
                  Network Structure
                </h2>
                <p className="text-sm text-cyan-300/60">
                  Explore your network in 3D space
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="bg-black/20 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* 3D Network Visualization */}
            {isLoading ? (
              <div className="flex items-center justify-center h-[600px] bg-black/20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : transformedData ? (
              <NetworkGraph data={transformedData} onNodeClick={handleNodeClick} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[600px] bg-black/20">
                <Users className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-lg font-medium text-gray-400">No network data available</p>
                <p className="text-sm text-gray-500">Start growing your network by inviting others</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bonus Reward Notification */}
        <AnimatePresence>
          {showBonusReward && (
            <motion.div
              className="fixed bottom-4 right-4 z-50"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
            >
              <Card className="bg-gradient-to-r from-yellow-900 to-amber-900 border-yellow-500">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Network Bonus!</CardTitle>
                  <CardDescription className="text-yellow-300/80">
                    You've unlocked a new achievement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-yellow-900" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Level {networkLevel} Reached!</p>
                      <p className="text-sm text-yellow-300/80">
                        Your network is growing stronger
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )