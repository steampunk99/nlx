import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ArrowUpRight, Users, DollarSign, Package, Activity, ChevronRight, TrendingUp } from 'lucide-react'
import { Skeleton } from "../../components/ui/skeleton"
import { useDashboardStats, useRecentActivities } from "../../hooks/useDashboard"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { cn } from "../../lib/utils"

function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()

  // Sample earnings data - replace with actual API data when available
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
      title: "Total Network",
      value: dashboardStats?.networkSize || "0",
      description: "Active members in your network",
      trend: dashboardStats?.networkTrend || "+0% from last month",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Earnings",
      value: dashboardStats?.totalEarnings || "$0",
      description: "Lifetime earnings",
      trend: dashboardStats?.earningsTrend || "+0% from last month",
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Active Packages",
      value: dashboardStats?.activePackages || "0",
      description: "Current investment packages",
      trend: dashboardStats?.packagesTrend || "+0% from last month",
      icon: Package,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Performance",
      value: dashboardStats?.performance || "0%",
      description: "Overall network growth",
      trend: dashboardStats?.performanceTrend || "+0% from last month",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
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
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              <div className={`mt-4 flex items-center text-sm font-medium ${stat.color}`}>
                <ArrowUpRight className="mr-1 h-4 w-4" />
                {stat.trend}
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities?.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type)
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-purple-500/20 ring-1 ring-white/10 flex items-center justify-center">
                        <ActivityIcon className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title || activity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.time || activity.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.value || activity.amount}</p>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        getActivityColor(activity.type)
                      )}>
                        {activity.status}
                      </span>
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