"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { useDashboardStats,useRewards, useEarnings, useRecentActivities } from "../../hooks/dashboard/useDashboard"
import { usePackages } from "../../hooks/payments/usePackages"
import { useCountry } from "../../hooks/config/useCountry"
import { useSiteConfig } from "../../hooks/config/useSiteConfig"
import { useCommissions } from "../../hooks/dashboard/useCommissions"
import MessageBoard from "./MessageBoard"

import { useQuery } from "@tanstack/react-query"
import { api } from "../../lib/axios"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  Filter
} from "lucide-react"

// Game-style metric card component inspired by Wordscapes
const MineCard = ({ title, value, change, changeType, icon: Icon, trend, gemType }) => {
  const gemColors = {
    gold: 'from-yellow-400 to-amber-600',
    diamond: 'from-blue-400 to-indigo-600', 
    ruby: 'from-red-400 to-pink-600',
    emerald: 'from-green-400 to-emerald-600'
  }
  
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden">
      {/* Decorative corner gem */}
      <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${gemColors[gemType] || gemColors.gold} rounded-full opacity-20`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gemColors[gemType] || gemColors.gold} shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{value}</p>
          </div>
        </div>
        {change && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full",
            changeType === 'positive' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {changeType === 'positive' ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4">
        
       
        </div>
      )}
    </div>
  )
}

function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()
  const { data: earnings, isLoading: isLoadingEarnings } = useEarnings()
  const { country, currency, formatAmount } = useCountry()
  const { commissions, commissionStats } = useCommissions()
  const { data: rewards } = useRewards()
  const { siteLogoUrl, promoImageUrl } = useSiteConfig()
  const { userPackage } = usePackages()
  const [activeQuest, setActiveQuest] = useState(null)
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

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

  const availableBalance = earnings?.availableBalance
  const dailyReward = rewards?.todayReward ? parseFloat(rewards.todayReward) : 0;

  if (isLoadingStats || isLoadingActivities) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    )
  }

  // Mineral trading metrics with game-style theming
  const mineMetrics = [
    {
      title: 'Vault',
      value: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      change: '+',
      changeType: 'positive',
      icon: DollarSign,
      trend: 75,
      gemType: 'gold'
    },
    {
      title: 'Daily Reward',
      value: `${currency.symbol} ${formatAmount(dailyReward)}`,
      change: '+',
      changeType: 'positive',
      icon: TrendingUp,
      trend: 60,
      gemType: 'emerald'
    },
    {
      title: 'Referrals',
      value: dashboardStats?.networkSize || '0',
      change: '+',
      changeType: 'positive',
      icon: Users,
      trend: 45,
      gemType: 'diamond'
    },
  
  ];

  // Activity helpers
  const getActivityIcon = (type) => {
    switch (type) {
      case 'commission':
        return DollarSign;
      case 'referral':
        return Users;
      default:
        return TrendingUp;
    }
  };

  // Format date to display like "Jan 1, 2023"
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

 

  return (
    <div className="space-y-8">
      {/* Game-style Header */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-200 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full opacity-10"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-10"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-amber-900 mb-2">
              ⛏️ Welcome back, {user?.firstName || 'Chief Miner'}!
            </h1>
            <p className="text-amber-700 font-semibold text-lg">
              Your mining operation status for today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
            onClick={() => navigate('/dashboard/withdrawals')}
              variant="outline"
              className="border-2 border-amber-300 text-amber-700 hover:bg-amber-100 font-semibold rounded-xl"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
            <Button
              onClick={() => navigate('/dashboard/network')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              View Referrals
            </Button>
          </div>
        </div>
      </div>
      {/* Mine Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mineMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
          >
            <MineCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mining Activity Log */}
        <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl overflow-hidden">
          <div className="p-6 border-b-2 border-amber-200/60 bg-gradient-to-r from-amber-100 to-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📋</span>
                </div>
                <h3 className="text-xl font-black text-amber-900">Mining Activity Log</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {recentActivities?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-200 to-orange-200 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                  <span className="text-2xl">⛏️</span>
                </div>
                <p className="text-amber-700 text-sm font-semibold">No mining activity yet</p>
                <p className="text-amber-600 text-xs mt-1">Start your mining operations to see activity here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities?.slice(0, 5).map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type)
                  const gemEmojis = ['💎', '🟡', '🔶', '💰', '⭐']
                  return (
                    <motion.div 
                      key={index} 
                      className="flex items-center gap-4 p-4 bg-white/60 border border-amber-200 rounded-xl hover:bg-white/80 hover:shadow-md transition-all duration-200"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition-transform">
                        <span className="text-lg">{gemEmojis[index % gemEmojis.length]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-amber-900 truncate">
                            {activity.type === 'commission' ? '💰 Gold Strike!' : 
                             activity.type === 'referral' ? '👥 New Miner Joined' : 
                             '⛏️ Mining Activity'}
                          </p>
                          {activity?.amount && (
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full border border-green-200">
                              <p className="text-sm font-black text-green-700">
                                +{currency.symbol} {formatAmount(activity.amount)}
                              </p>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-amber-600 mt-1 font-medium">
                          {formatDate(activity?.date)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mining Control Panel */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-2xl overflow-hidden">
          <div className="p-6 border-b-2 border-amber-200/60 bg-gradient-to-r from-amber-100 to-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center transform rotate-3">
                <span className="text-white font-bold text-sm">⚙️</span>
              </div>
              <h3 className="text-xl font-black text-amber-900">DAILY PROMOTIONS</h3>
            </div>
          </div>
          <div className="p-6 space-y-4">
       
         
            <Button 
              onClick={() => navigate('/dashboard/network')}
              className="w-full justify-start bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 text-amber-800 hover:from-yellow-200 hover:to-amber-200 font-bold rounded-xl transform hover:scale-105 transition-all shadow-md"
              variant="outline"
            >
              <DollarSign className="w-5 h-5 mr-3" />
              🏦 Referral Vault
            </Button>
          </div>

          <div className="p-6 space-y-4">
          {promoImageUrl && (
        <motion.div
          className="bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 border-2 border-purple-200 rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        >
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20"></div>
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20"></div>
          
          <div className="p-6 flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
                <h3 className="text-2xl font-black text-purple-900">🎉 Special Mining Event!</h3>
              </div>
              <p className="text-purple-800 font-semibold text-lg mb-4">
                Upgrade your mining equipment and unlock rare gem deposits! Limited time bonus rewards available.
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all">
                🚀 Claim Rewards
              </Button>
            </div>
            <div className="flex-shrink-0">
              <div className="relative">
                <img
                  src={promoImageUrl}
                  alt="Special Mining Event"
                  className="w-48 h-32 object-cover rounded-xl border-2 border-purple-300 shadow-lg transform rotate-2 hover:rotate-0 transition-transform"
                  onError={e => {
                    const target = e.target;
                    if (target instanceof HTMLImageElement) {
                      target.onerror = null;
                      target.src = '/placeholder-promo.jpg';
                    }
                  }}
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  ✨
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
          </div>
        </div>
      </div>

      {/* Special Mining Event Banner */}
     
    </div>
  );
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
