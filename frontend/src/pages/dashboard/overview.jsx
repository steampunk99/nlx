"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sword,
  Shield,
  Trophy,
  Users,
  DollarSign,
  ArrowUp,
  Star,
  Package,
  Activity,
  Coins,
  Heart,
  Zap,
  ChevronRight,
  TrendingUp,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { useDashboardStats, useEarnings, useRecentActivities } from "../../hooks/dashboard/useDashboard"
import { usePackages } from "../../hooks/payments/usePackages"
import { useCountry } from "../../hooks/config/useCountry"
import { useSiteConfig } from "../../hooks/config/useSiteConfig"
import { useCommissions } from "../../hooks/dashboard/useCommissions"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../lib/axios"

function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()
  const { data: earnings, isLoading: isLoadingEarnings } = useEarnings()
  const { country, currency, formatAmount } = useCountry()
  const { commissions, commissionStats } = useCommissions()
  const { siteLogoUrl, promoImageUrl } = useSiteConfig()
  const { userPackage } = usePackages()
  const [activeQuest, setActiveQuest] = useState(null)

  // Fetch withdrawal history
  const { data: withdrawalsData } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const response = await api.get("/withdrawals")
      return response.data.data
    },
  })

  const withdrawalHistory =
    withdrawalsData?.withdrawals?.map((withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      phone: withdrawal.details?.phone,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
    })) || []

  // Calculate total withdrawn amount
  const totalWithdrawn = withdrawalHistory.reduce(
    (total, withdrawal) => total + (withdrawal.status === "SUCCESSFUL" ? Number(withdrawal.amount) : 0),
    0,
  )

  const availableBalance = commissionStats?.totalCommissions || 0

  if (isLoadingStats || isLoadingActivities) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  // Updated stats with neon colors
  const stats = [
    {
      title: "Available Balance",
      value: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      description: "Your available balance",
      icon: DollarSign,
      color: "#36f9f6", // Neon cyan
      bgColor: "from-cyan-500/20 to-cyan-600/10",
      iconBg: "bg-cyan-900/30",
      secondaryValue: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      secondaryLabel: "This month",
    },
    {
      title: "Daily Reward",
      value: `${currency.symbol} ${formatAmount(totalWithdrawn || 0)}`,
      description: "Your daily earnings",
      icon: Wallet,
      color: "#fe53bb", // Neon pink
      bgColor: "from-pink-500/20 to-pink-600/10",
      iconBg: "bg-pink-900/30",
      secondaryValue: `${currency.symbol} ${formatAmount(totalWithdrawn || 0)}`,
      secondaryLabel: "24h Change",
    },
    {
      title: "Network Size",
      value: dashboardStats?.networkSize || "0",
      description: "Active members in your network",
      icon: Users,
      color: "#7b61ff", // Neon purple
      bgColor: "from-purple-500/20 to-purple-600/10",
      iconBg: "bg-purple-900/30",
      secondaryValue: dashboardStats?.networkSize || "0",
      secondaryLabel: "Total Members",
    },
    {
      title: "Active Package",
      value: userPackage ? "ACTIVE" : "NONE",
      description: "Current investment package",
      icon: Package,
      color: "#ffd32a", // Neon yellow
      bgColor: "from-yellow-500/20 to-yellow-600/10",
      iconBg: "bg-yellow-900/30",
      secondaryValue: `${currency.symbol} ${formatAmount(userPackage?.package?.price || 0)}`,
      secondaryLabel: "Package Value",
    },
  ]

  // Define quests based on user data
  const quests = [
    {
      title: "Recruit 3 Team Members",
      description: "Grow your network by recruiting 3 new members",
      reward: `${currency.symbol} 5,000 + 100 XP`,
      progress: Math.min(Math.round(((dashboardStats?.networkSize || 0) / 3) * 100), 100),
      icon: Users,
      color: "#60a5fa", // Blue - matches Network nav item
      bgColor: "from-blue-500/20 to-blue-600/10",
    },
    {
      title: "Upgrade Package",
      description: "Upgrade to a premium package to unlock more rewards",
      reward: `${currency.symbol} 10,000 + 200 XP`,
      progress: userPackage ? 100 : 0,
      icon: Star,
      color: "#c084fc", // Purple - matches Packages nav item
      bgColor: "from-purple-500/20 to-purple-600/10",
    },
    {
      title: "Complete Profile",
      description: "Fill in all your profile information",
      reward: `${currency.symbol} 1,000 + 50 XP`,
      progress: 75, // This would ideally be calculated based on profile completion
      icon: Shield,
      color: "#94a3b8", // Gray - matches Settings nav item
      bgColor: "from-gray-500/20 to-gray-600/10",
    },
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case "commission":
        return Coins
      case "network":
        return Users
      default:
        return Activity
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case "commission":
        return {
          bg: "bg-green-900/30",
          text: "text-green-400",
          ring: "ring-green-400/20",
        }
      case "network":
        return {
          bg: "bg-blue-900/30",
          text: "text-blue-400",
          ring: "ring-blue-400/20",
        }
      default:
        return {
          bg: "bg-yellow-900/30",
          text: "text-yellow-400",
          ring: "ring-yellow-400/20",
        }
    }
  }

  const getActivityEmoji = (type) => {
    switch (type) {
      case "commission":
        return "💰"
      case "network":
        return "🤝"
      default:
        return "🎉"
    }
  }

  // Format date to display like "Jan 1, 2023"
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Calculate player level based on network size and commissions
  const calculatePlayerLevel = () => {
    const networkSize = dashboardStats?.networkSize || 0
    const totalCommissions = commissionStats?.totalCommissions || 0

    // Simple algorithm: 1 level for every 3 referrals + 1 level for every $1000 in commissions
    const networkLevel = Math.floor(networkSize / 3)
    const commissionLevel = Math.floor(totalCommissions / 1000)

    return Math.max(1, networkLevel + commissionLevel)
  }

  const playerLevel = calculatePlayerLevel()
  const playerXP = 450 // This would ideally be calculated based on user activity
  const playerHealth = 85 // This could be tied to account activity or login streak
  const playerMana = 70 // This could be tied to available actions or resources

  const achievements = [
    {
      title: "First Referral",
      description: "Recruit your first team member",
      icon: Users,
      color: "#60a5fa",
      completed: dashboardStats?.networkSize > 0,
    },
    {
      title: "Package Activated",
      description: "Activate your first investment package",
      icon: Package,
      color: "#c084fc",
      completed: !!userPackage,
    },
    {
      title: "Withdrawal Made",
      description: "Make your first withdrawal",
      icon: DollarSign,
      color: "#4ade80",
      completed: totalWithdrawn > 0,
    },
  ]

  return (
    <div className="relative space-y-6 p-6 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,#1a103b,transparent)]"></div>
        
        {/* Animated glow spots */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              Welcome back, {user?.firstName || "サイバーパンク"}!
            </h1>
            <p className="text-cyan-300/80">Your digital empire awaits.</p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/network")}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/20 border border-cyan-700/50"
          >
            <Users className="mr-2 h-5 w-5" />
            Network Matrix
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="relative bg-black/30 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Glowing border effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse" />
              </div>
              
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.iconBg)}>
                    <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-cyan-300/80">{stat.title}</p>
                    <p className="text-xl font-bold truncate" style={{ color: stat.color }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-cyan-300/60">{stat.secondaryLabel}</span>
                  <div className="flex items-center gap-1">
                    {stat.title === "Available Balance" && availableBalance > 0 && (
                      <ArrowUp className="w-3 h-3 text-cyan-400" />
                    )}
                    <span style={{ color: stat.color }} className="font-medium">
                      {stat.secondaryValue}
                    </span>
                  </div>
                </div>

                {/* Accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r" style={{
                  backgroundImage: `linear-gradient(to right, ${stat.color}50, ${stat.color}, ${stat.color}50)`
                }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Active Quests */}
          <motion.div
            className="relative bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg overflow-hidden group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="p-6 relative">
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center mb-4">
                <Sword className="w-5 h-5 mr-2 text-cyan-400" />
                My Quests
              </h2>

              <div className="space-y-3">
                {quests.map((quest, index) => (
                  <motion.div
                    key={quest.title}
                    className="relative bg-black/30 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-400/40 transition-colors cursor-pointer group/quest"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    onClick={() => setActiveQuest(activeQuest === quest.title ? null : quest.title)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover/quest:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                        <quest.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-cyan-100">{quest.title}</h3>
                        <p className="text-sm text-cyan-300/60">{quest.description}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-cyan-400/80 mb-1.5">
                            <span>My progress</span>
                            <span>{quest.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-cyan-400 to-blue-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${quest.progress}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                            />
                          </div>
                        </div>

                        <AnimatePresence>
                          {activeQuest === quest.title && (
                            <motion.div
                              className="mt-3 flex justify-between items-center"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <div className="flex items-center text-yellow-400 text-sm">
                                <Trophy className="w-4 h-4 mr-1" />
                                <span>{quest.reward}</span>
                              </div>
                              <button
                                className="px-4 py-1.5 rounded text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-colors shadow-lg shadow-cyan-500/20"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (quest.title === "Recruit 3 Team Members") {
                                    navigate("/dashboard/network")
                                  } else if (quest.title === "Upgrade Package") {
                                    navigate("/dashboard/packages")
                                  } else if (quest.title === "Complete Profile") {
                                    navigate("/dashboard/profile")
                                  }
                                }}
                              >
                                start
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div
            className="relative bg-black/40 backdrop-blur-sm border border-purple-500/20 rounded-lg overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            <div className="p-6 relative">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center mb-4">
                <Activity className="w-5 h-5 mr-2 text-purple-400" />
                My Activity
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {recentActivities?.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  const colors = getActivityColor(activity.type)
                  const emoji = getActivityEmoji(activity.type)
                  const isNew = index === 0

                  return (
                    <motion.div
                      key={index}
                      className="relative bg-black/20 border border-purple-500/20 rounded-lg p-4 group/activity"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover/activity:opacity-100 transition-opacity"></div>
                      
                      {isNew && (
                        <span className="absolute right-4 top-4 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                          <span className="text-xl" role="img" aria-label="activity icon">{emoji}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-purple-100 truncate">{activity.description}</p>
                            {activity?.amount && (
                              <p className="flex-shrink-0 text-purple-400">
                                {currency.symbol} {formatAmount(activity?.amount)}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <p className="text-purple-300/60">{formatDate(activity?.date)}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <ActivityIcon className="h-3 w-3" />
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Special Offer / Promo Image */}
        <motion.div
          className="bg-gradient-to-br from-indigo-900/70 to-purple-900/70 border border-indigo-700/50 rounded-xl overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

          <div className="p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              </motion.div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Special Offers
              </h2>
            </div>

            {promoImageUrl ? (
              <motion.div
                className="h-[300px] rounded-xl overflow-hidden group relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.img
                  src={promoImageUrl}
                  alt="Promotional Offer"
                  className="w-full h-full object-contain rounded-lg"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = siteLogoUrl || "/placeholder-promo.jpg"
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-white font-medium mb-2">🎉 Limited Time Offer!</p>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className="bg-black/30 border border-indigo-700/30 rounded-lg p-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Gold Rush</h3>
                      <p className="text-xs text-gray-300">Refer 3 new members this week</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-yellow-500">Reward: 5,000 Gold</div>
                    <button
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                      onClick={() => navigate("/dashboard/network")}
                    >
                      Accept
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-black/30 border border-indigo-700/30 rounded-lg p-4 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Elite Package</h3>
                      <p className="text-xs text-gray-300">Upgrade to Premium tier</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs text-yellow-500">Reward: Legendary Item</div>
                    <button
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                      onClick={() => navigate("/dashboard/packages")}
                    >
                      Accept
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Wallet component for the icon
function Wallet(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

export default DashboardOverview
