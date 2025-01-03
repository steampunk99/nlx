import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ArrowUpRight, Users, DollarSign, Package, Activity, ChevronRight, TrendingUp } from 'lucide-react'
import { Skeleton } from "../../components/ui/skeleton"
import { useDashboardStats, useEarnings, useRecentActivities } from "../../hooks/useDashboard"
import { motion } from "framer-motion"
import { ResponsiveContainer,LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { cn } from "../../lib/utils"
import { usePackages } from "../../hooks/usePackages"

// Format currency in UGX
const formatCurrency = (amount) => {
  if (!amount) return "UGX 0";
  
  if (typeof amount === 'string' && amount.startsWith('$')) {
    amount = parseFloat(amount.replace('$', '').replace(/ ,/g, ''))
  }
  
  const value = Number(amount);
  if (isNaN(value)) return "UGX 0";
    // Format with thousands separator
    const formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `UGX ${formatted}`;
};
  
function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()
  const { data: earnings, isLoading: isLoadingEarnings } = useEarnings()
  
  const { userPackage} = usePackages()
  // Sample earnings data - will replace with actual API data when available
  const earningsData = [
    { date: 'Jan', amount: 400 },
    { date: 'Feb', amount: 600 },
    { date: 'Mar', amount: 800 },
    { date: 'Apr', amount: 1000 },
    { date: 'May', amount: 1200 },
    { date: 'Jun', amount: 1400 },
  ]

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
      title: "Direct Referrals",
      value: dashboardStats?.networkSize || "0",
      description: "Active members in your network",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      secondaryValue: dashboardStats?.networkSize || "0",
      secondaryLabel: "New this month"
    },
  
    {
      title: "Available Balance",
      value: formatCurrency(earnings?.availableBalance || 0),
      description: "Your available balance",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      secondaryValue: formatCurrency(earnings?.availableBalance || 0),
      secondaryLabel: "This month"
    },
    {
      title: "Active Packages",
      value: userPackage ? "1" : "0",
      description: "Current investment packages",
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      secondaryValue: formatCurrency(userPackage?.package?.price || 0),
      secondaryLabel: "Total value"
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'earning':
        return DollarSign
      case 'referral':
        return Users
      case 'package':
        return Package
      default:
        return Activity
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'earning':
        return "bg-green-500/10 text-green-500"
      case 'referral':
        return "bg-blue-500/10 text-blue-500"
      case 'package':
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return "bg-purple-500/10 text-purple-500"
    }
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
        {/* Earnings Chart */}
        <Card className="overflow-hidden border-none bg-gradient-to-br from-gray-900 to-gray-800">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl text-white">Earnings Overview</CardTitle>
            <CardDescription className="text-gray-400">Your earnings history over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.5)"
                    tick={{ fill: 'rgba(255,255,255,0.5)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17,17,17,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="url(#gradient)" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#EAB308" />
                      <stop offset="100%" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
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
                const colorClass = getActivityColor(activity.type)
                const isNew = index === 0 // Assuming first item is newest
                
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "relative p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      "animate-in fade-in slide-in-from-bottom-2 duration-500",
                      { "delay-100": index === 0 },
                      { "delay-200": index === 1 },
                      { "delay-300": index === 2 }
                    )}
                  >
                    {isNew && (
                      <span className="absolute right-4 top-4 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105",
                        colorClass.replace("text-", "bg-").replace("/10", "/20")
                      )}>
                        <ActivityIcon className={cn("h-6 w-6", colorClass)} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {activity.title || activity.description}
                          </p>
                          <p className={cn(
                            "font-medium",
                            activity.type === 'earning' && "text-green-600 dark:text-green-400"
                          )}>
                           {formatCurrency(activity.value || activity.amount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {activity.time || activity.date}
                          </p>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                            colorClass
                          )}>
                            {activity.status}
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