import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { DollarSign, Users, Package, ArrowUpRight } from 'lucide-react'

// Sample data - replace with actual API calls
const stats = [
  {
    title: "Total Earnings",
    value: "$12,345",
    description: "Total earnings from all sources",
    icon: DollarSign,
    trend: "+12.5%",
    color: "text-green-500"
  },
  {
    title: "Network Size",
    value: "156",
    description: "Total members in your network",
    icon: Users,
    trend: "+5.2%",
    color: "text-blue-500"
  },
  {
    title: "Active Packages",
    value: "3",
    description: "Currently active investment packages",
    icon: Package,
    trend: "0%",
    color: "text-purple-500"
  }
]

const recentActivities = [
  {
    type: "commission",
    description: "Earned commission from referral",
    amount: "+$250",
    date: "2 hours ago",
    icon: "ph:money"
  },
  {
    type: "network",
    description: "New member joined your network",
    amount: "Level 2",
    date: "5 hours ago",
    icon: "ph:users"
  },
  {
    type: "package",
    description: "Investment package activated",
    amount: "Gold Package",
    date: "1 day ago",
    icon: "ph:package"
  }
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <div className={`mt-2 flex items-center text-sm ${stat.color}`}>
                <ArrowUpRight className="mr-1 h-4 w-4" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions and network updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon icon={activity.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <div className="font-medium">{activity.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}