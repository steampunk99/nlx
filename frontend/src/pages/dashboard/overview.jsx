import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDashboardStats, useEarnings, useRecentActivities } from "../../hooks/useDashboard"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"
import { usePackages } from "../../hooks/usePackages"
import { useCountry } from "@/hooks/useCountry"
import { useSiteConfig } from "@/hooks/useSiteConfig" 
import { Badge } from '../../components/ui/badge'
import { Link } from 'react-router-dom'
import { useCommissions } from '../../hooks/useCommissions'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { Coins } from 'lucide-react'
import { ArrowUpRight, Users, DollarSign, Package, Activity, ChevronRight, TrendingUp } from 'lucide-react'
import { Skeleton } from "../../components/ui/skeleton"


  
function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()
  const { data: earnings, isLoading: isLoadingEarnings } = useEarnings()
  const { country, currency, formatAmount } = useCountry()
  const { commissions, commissionStats } = useCommissions()
  const { siteLogoUrl, promoImageUrl } = useSiteConfig() 
  const { userPackage} = usePackages()

  

  const availableBalance = commissionStats?.totalCommissions || 0

    // Fetch withdrawal history
    const { data: withdrawalsData } = useQuery({
      queryKey: ['withdrawals'],
      queryFn: async () => {
        const response = await api.get('/withdrawals')
        return response.data.data
      }
    })

  const withdrawalHistory = withdrawalsData?.withdrawals?.map((withdrawal) => ({
    id: withdrawal.id,
    amount: withdrawal.amount,
    phone: withdrawal.details?.phone,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt
  })) || []

  // Calculate total withdrawn amount
  const totalWithdrawn = withdrawalHistory.reduce((total, withdrawal) => 
    total + (withdrawal.status === 'SUCCESSFUL' ? Number(withdrawal.amount) : 0)
  , 0)


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

  const stats = [
    {
      title: "Available Balance",
      value: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      description: "Your available balance",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-transparent",
      secondaryValue: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      secondaryLabel: "This month"
    },
    {
      title: "Total Withdrawn",
      value: `${currency.symbol} ${formatAmount(totalWithdrawn|| 0)}`,
      description: "Your available balance",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-transparent",
      secondaryValue: `${currency.symbol} ${formatAmount(totalWithdrawn|| 0)}`,
      secondaryLabel: "This month"
    },
    {
      title: "Direct Referrals",
      value: dashboardStats?.networkSize || "0",
      description: "Active members in your network",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-transparent",
      secondaryValue: dashboardStats?.networkSize || "0",
      secondaryLabel: "New this month"
    },
   
    {
      title: "Active Packages",
      value: userPackage ? "1" : "0",
      description: "Current investment packages",
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-transparent",
      secondaryValue: `${currency.symbol} ${formatAmount(userPackage?.package?.price || 0)}`,
      secondaryLabel: "Total value"
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'commission':
        return Coins;
      case 'network':
        return Users;
      default:
        return Activity;
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'commission':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          ring: 'ring-green-600/20 dark:ring-green-400/20'
        };
      case 'network':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          ring: 'ring-blue-600/20 dark:ring-blue-400/20'
        };
      default:
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'text-yellow-600 dark:text-yellow-400',
          ring: 'ring-yellow-600/20 dark:ring-yellow-400/20'
        };
    }
  }

  const getActivityEmoji = (type) => {
    switch (type) {
      case 'commission':
        return '💰';
      case 'network':
        return '🤝';
      default:
        return '🎉';
    }
  }

  //format date to display like "Jan 1, 2023"
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your network today.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard/network')}
          size="lg"
          className="bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white shadow-lg"
        >
          View Network
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={cn(
              "overflow-hidden transition-all hover:shadow-lg",
              "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={cn(
                "rounded-full p-2.5 transition-transform hover:scale-110",
                stat.bgColor
              )}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">
                    {stat.secondaryLabel}
                  </span>
                  <span className={cn("font-medium", stat.color)}>
                    {stat.secondaryValue}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Promo Image */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-gray-900 to-gray-800">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl text-white">Promotional Offers</CardTitle>
            <CardDescription className="text-gray-400">Latest updates and offers</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[400px] flex items-center justify-center rounded-xl">
              {promoImageUrl ? (
                <img 
                  src={promoImageUrl} 
                  alt="Promotional Offer" 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = siteLogoUrl || '/placeholder-promo.jpg'; 
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>No promotional content available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-center">Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest updates from your network</CardDescription>
              </div>
             
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[300px] overflow-y-auto">
              {recentActivities?.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                const colors = getActivityColor(activity.type)
                const emoji = getActivityEmoji(activity.type)
                const isNew = index === 0
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "relative p-4 transition-all hover:bg-gray-50/50 dark:hover:bg-gray-800/50",
                      "animate-in fade-in slide-in-from-bottom-2 duration-500",
                      { "delay-100": index === 0 },
                      { "delay-200": index === 1 },
                      { "delay-300": index === 2 }
                    )}
                  >
                    {isNew && (
                      <span className="absolute right-4 top-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105",
                        colors.bg
                      )}>
                        <span className="text-xl" role="img" aria-label="activity icon">
                          {emoji}
                        </span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {activity.description}
                          </p>
                          {activity?.amount && (
                            <>
                              <p className={cn(
                                "font-medium",
                                colors.text
                              )}>
                                {currency.symbol} {formatAmount(activity?.amount)}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(activity?.date)}
                          </p>
                          <span className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                            colors.bg,
                            colors.text,
                            colors.ring
                          )}>
                            <ActivityIcon className="h-3 w-3" />
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardOverview