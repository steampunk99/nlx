import { useAdmin } from '../../hooks/admin/useAdmin'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { 
  Users, 
  Package, 
  DollarSign, 
  Network, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  UserCheck,
  Boxes,
  TrendingUp,
  Signal,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { Progress } from '../../components/ui/progress'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '@/hooks/auth/useAuth'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Badge } from '../../components/ui/badge'
import { Button } from '@/components/ui/button'
import { useHealth } from '@/hooks/auth/useHealth'

export function AdminDashboardPage() {
  const { useSystemStats, useNetworkStats, useTransactions } = useAdmin()
  const { data: stats, isLoading: isStatsLoading } = useSystemStats()
  const { data: networkStats, isLoading: isNetworkLoading } = useNetworkStats()
  const { data: transactions, isLoading: isTransactionsLoading } = useTransactions({ dashboard: true })
  const [revenueData, setRevenueData] = useState([])
  const { data: healthData, refetch: checkHealth, isLoading: isHealthLoading } = useHealth()
  const [isHealthChecking, setIsHealthChecking] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' })

  const { user } = useAuth()

  useEffect(() => {
    console.log('Transaction data received:', transactions)
    if (transactions?.transactions) {
      console.log('Processing transactions for revenue chart...')
      // Process transactions for revenue chart
      const dailyRevenue = transactions.transactions.reduce((acc, tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString()
        acc[date] = (acc[date] || 0) + Number(tx.amount)
        console.log(`Date: ${date}, Current Total: ${acc[date]}`)
        return acc
      }, {})

      console.log('Daily revenue data:', dailyRevenue)

      const chartData = Object.entries(dailyRevenue).map(([date, amount]) => ({
        date,
        amount
      }))

      console.log('Final chart data:', chartData)
      setRevenueData(chartData)
    }
  }, [transactions])

  useEffect(() => {
    console.log('Stats data received:', stats)
    if (stats?.recentActivities) {
      console.log('Recent activities:', stats.recentActivities)
    }
  }, [stats])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
  }

  const handleHealthCheck = async () => {
    setIsHealthChecking(true)
    try {
      await checkHealth()
      setToastMessage({
        type: healthData?.ok ? 'success' : 'error',
        text: healthData?.ok ? 'All systems operational' : 'System is currently offline'
      })
      setShowToast(true)
      // Hide toast after 2 seconds
      setTimeout(() => setShowToast(false), 2000)
    } finally {
      setTimeout(() => {
        setIsHealthChecking(false)
      }, 1000)
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2f2f2]">
      {/* Abstract Background */}
      <div 
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0)_50%)]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")"
        }}
      />

      <div className="container mx-auto py-6 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.firstName}</h1>
          <div className="relative">
            {/* Toast Notification */}
            {showToast && (
              <div className={cn(
                "absolute bottom-full mb-2 right-0 py-1 px-3 rounded-full text-xs font-medium shadow-lg transition-all duration-200 transform translate-y-0 opacity-100 z-50",
                "flex items-center gap-1.5 min-w-[140px] whitespace-nowrap",
                toastMessage.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              )}>
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {toastMessage.text}
              </div>
            )}
            
            <Button 
              variant="outline" 
              className={cn(
                "transition-all duration-300 w-10 h-10 p-0",
                isHealthChecking && "animate-none",
                healthData?.ok && !isHealthChecking && "border-green-500 text-green-600 hover:border-green-600 hover:text-green-700",
                healthData && !healthData.ok && !isHealthChecking && "border-red-500 text-red-600 hover:border-red-600 hover:text-red-700",
                "relative"
              )}
              onClick={handleHealthCheck}
              disabled={isHealthChecking}
            >
              <Activity className={cn(
                "h-4 w-4 transition-transform",
                isHealthChecking && "animate-spin"
              )} />
              {healthData && !isHealthChecking && (
                <span className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                  healthData.ok ? "bg-green-500" : "bg-red-500"
                )} />
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* User Stats */}
          <Card 
            className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
            onClick={() => {/* Navigate to users page */}}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatNumber(stats?.users?.total || 0)}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-blue-700">
                  {formatNumber(stats?.users?.active || 0)} active users
                </p>
                <Badge variant="secondary" className="bg-blue-200 text-blue-700">
                  {Math.round((stats?.users?.active / stats?.users?.total) * 100) || 0}% active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Package Stats */}
          <Card 
            className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
            onClick={() => {/* Navigate to packages page */}}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Active Packages</CardTitle>
              <Boxes className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatNumber(stats?.packages?.active || 0)}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-purple-700">
                  {formatNumber(stats?.packages?.total || 0)} total packages
                </p>
                <Badge variant="secondary" className="bg-purple-200 text-purple-700">
                  {Math.round((stats?.packages?.active / stats?.packages?.total) * 100) || 0}% active
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* System revenue Stats */}
          <Card 
            className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
            onClick={() => {/* Navigate to revenue page */}}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-800">System Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(stats?.revenue?.systemRevenue || 0)}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-green-700">
                  {formatCurrency(stats?.revenue?.commissions || 0)} in commissions
                </p>
                <Badge variant="secondary" className="bg-green-200 text-green-700">
                  +{formatNumber(transactions?.transactions?.length || 0)} txns
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Network Stats */}
          <Card 
            className="bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
            onClick={() => {/* Navigate to network page */}}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Network Overview</CardTitle>
              <Signal className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{formatNumber(networkStats?.nodes?.total || 0)}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-amber-700">
                  {formatNumber(networkStats?.nodes?.active || 0)} active nodes
                </p>
                <Badge variant="secondary" className="bg-amber-200 text-amber-700">
                  {Math.round((networkStats?.nodes?.active / networkStats?.nodes?.total) * 100) || 0}% active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Revenue Chart */}
          <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Revenue Trend</h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Link to="/admin/packages">View All</Link>
                <ArrowUpRight className="h-4 w-4" />
                
              </Button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
                  <YAxis stroke="rgba(0,0,0,0.5)" />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                    cursor={{ fill: 'rgba(124, 93, 250, 0.1)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#7c5dfa"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {transactions?.pendingCount || 0} pending
                </Badge>
                <Button variant="outline" size="sm">
                  <Link to="/admin/finance/transactions">View All</Link>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {transactions?.transactions?.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between hover:bg-white/40 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Activity className={cn(
                      "h-4 w-4",
                      tx.status === 'PENDING' && "text-blue-500",
                      tx.status === 'SUCCESSFUL' && "text-green-500",
                      tx.status === 'FAILED' && "text-red-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()} • @{tx.node.user.username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-sm font-medium font-mono",
                      tx.status === 'PENDING' && "text-blue-600",
                      tx.status === 'SUCCESSFUL' && "text-green-600",
                      tx.status === 'FAILED' && "text-red-600"
                    )}>
                      {formatCurrency(tx.amount)}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        tx.status === 'PENDING' && "bg-blue-100 text-blue-700",
                        tx.status === 'SUCCESSFUL' && "bg-green-100 text-green-700",
                        tx.status === 'FAILED' && "bg-red-100 text-red-700"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!transactions?.transactions || transactions.transactions.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No recent activity
                </div>
              )}
            </div>
          </Card>

          {/* Network Distribution */}
          <Card className="p-6 bg-white/60 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-medium mb-4">Network Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Nodes</span>
                  <span>{formatNumber(networkStats?.nodes?.active || 0)}</span>
                </div>
                <Progress 
                  value={(networkStats?.nodes?.active / networkStats?.nodes?.total) * 100 || 0} 
                  className="bg-blue-100"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 ">
                  <span>Pending Withdrawals</span>
                  <span>{formatNumber(stats?.pendingWithdrawals || 0)}</span>
                </div>
                <Progress 
                  value={(stats?.pendingWithdrawals / stats?.revenue?.total) * 100 || 0}
                  className="bg-purple-100"
                />
              </div>
            </div>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="p-6 bg-background backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-medium mb-4">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[300px] relative">
              
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-sm text-gray-700 mb-6">
                    Net System Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-700 font-mono">
                    {formatCurrency(stats?.revenue?.systemRevenue || 0)}
                  </div>
                 
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                    <span className="font-medium text-green-700">Package Sales</span>
                  </div>
                  <span className="font-semibold text-green-700 font-mono">{formatCurrency(stats?.revenue?.total || 0)}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-sm text-orange-700">Commissions</span>
                  </div>
                  <span className="font-semibold text-orange-700 font-mono">- {formatCurrency(stats?.revenue?.commissions || 0)}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <span className="text-sm text-orange-300">Withdrawals</span>
                  </div>
                  <span className="font-semibold text-orange-700 font-mono">- {formatCurrency(stats?.revenue?.withdrawals || 0)}</span>
                </div>

              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
