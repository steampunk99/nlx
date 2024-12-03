import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { DollarSign, Users, Package, Loader2 } from 'lucide-react'
import { useDashboardStats, useRecentActivities } from "../../hooks/useDashboard"
import { formatDistanceToNow } from 'date-fns'

export default function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivities();

  const statCards = [
    {
      title: "Total Earnings",
      value: stats?.totalEarnings || "$0",
      description: "Total earnings from all sources",
      icon: DollarSign,
      trend: stats?.earningsTrend || "0%",
      color: "text-green-500"
    },
    {
      title: "Network Size",
      value: stats?.networkSize || "0",
      description: "Total members in your network",
      icon: Users,
      trend: stats?.networkTrend || "0%",
      color: "text-blue-500"
    },
    {
      title: "Active Packages",
      value: stats?.activePackages || "0",
      description: "Currently active investment packages",
      icon: Package,
      trend: stats?.packagesTrend || "0%",
      color: "text-purple-500"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend && (
                <div className={`text-xs mt-1 ${stat.color}`}>
                  {stat.trend}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest network and earning activities</CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {activities?.map((activity, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <Icon icon={activity.icon} className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-sm font-medium">{activity.amount}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}