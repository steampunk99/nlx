import { useAdmin } from '../../hooks/useAdmin'
import { Card } from '../../components/ui/card'
import { Users, Package, DollarSign, Network, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function AdminDashboardPage() {
  const { useSystemStats, useNetworkStats } = useAdmin()
  const { data: stats, isLoading: isStatsLoading } = useSystemStats()
  const { data: networkStats, isLoading: isNetworkLoading } = useNetworkStats()

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

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* User Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
            <div className="flex items-center mt-1 text-xs">
              {stats?.userGrowth >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={stats?.userGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(stats?.userGrowth || 0)}% this week
              </span>
            </div>
          </div>
        </Card>

        {/* Package Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Packages</h3>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{formatNumber(stats?.activePackages || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.totalPackageValue || 0)} total value
            </div>
          </div>
        </Card>

        {/* System revenue Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">System Revenue</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{formatCurrency(stats?.systemRevenue || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats?.pendingCommissions || 0)} pending
            </div>
          </div>
        </Card>

        {/* Network Stats */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Network Overview</h3>
            <Network className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">{formatNumber(networkStats?.totalNodes || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatNumber(networkStats?.activeNodes || 0)} active nodes
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Network Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Network Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level 1</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-blue-100 rounded-full w-32">
                  <div 
                    className="h-2 bg-blue-500 rounded-full" 
                    style={{ 
                      width: `${(networkStats?.levelDistribution?.[1] / networkStats?.totalNodes * 100) || 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{formatNumber(networkStats?.levelDistribution?.[1] || 0)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level 2</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-green-100 rounded-full w-32">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ 
                      width: `${(networkStats?.levelDistribution?.[2] / networkStats?.totalNodes * 100) || 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{formatNumber(networkStats?.levelDistribution?.[2] || 0)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Level 3+</span>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-purple-100 rounded-full w-32">
                  <div 
                    className="h-2 bg-purple-500 rounded-full" 
                    style={{ 
                      width: `${(networkStats?.levelDistribution?.[3] / networkStats?.totalNodes * 100) || 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">{formatNumber(networkStats?.levelDistribution?.[3] || 0)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
          {stats?.recentActivities?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={activity.type === 'success' ? 'success' : 'secondary'}>
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activities</p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage
