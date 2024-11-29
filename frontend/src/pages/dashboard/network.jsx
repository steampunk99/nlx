import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { Users, UserPlus, ArrowUpRight } from 'lucide-react'

// Sample data - replace with actual API calls
const networkStats = [
  {
    title: "Direct Referrals",
    value: "12",
    description: "Members directly referred by you",
    icon: UserPlus,
    trend: "+2 this month",
    color: "text-blue-500"
  },
  {
    title: "Total Network",
    value: "156",
    description: "Total members in your downline",
    icon: Users,
    trend: "+15 this month",
    color: "text-green-500"
  }
]

const networkLevels = [
  {
    level: 1,
    members: 12,
    earnings: "$1,200",
    active: 10
  },
  {
    level: 2,
    members: 48,
    earnings: "$960",
    active: 35
  },
  {
    level: 3,
    members: 96,
    earnings: "$480",
    active: 70
  }
]

const recentReferrals = [
  {
    name: "John Doe",
    date: "2 hours ago",
    package: "Gold Package",
    status: "active",
    level: 1
  },
  {
    name: "Jane Smith",
    date: "1 day ago",
    package: "Silver Package",
    status: "active",
    level: 1
  },
  {
    name: "Mike Johnson",
    date: "3 days ago",
    package: "Bronze Package",
    status: "pending",
    level: 2
  }
]

export default function NetworkPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Network</h1>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <UserPlus className="mr-2 h-4 w-4" />
          Share Referral Link
        </button>
      </div>

      {/* Network Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {networkStats.map((stat, index) => (
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

      {/* Network Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Network Levels</CardTitle>
          <CardDescription>Breakdown of your network by levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Members</th>
                  <th className="px-6 py-3">Active</th>
                  <th className="px-6 py-3">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {networkLevels.map((level) => (
                  <tr key={level.level} className="border-b">
                    <td className="px-6 py-4">Level {level.level}</td>
                    <td className="px-6 py-4">{level.members}</td>
                    <td className="px-6 py-4">{level.active}</td>
                    <td className="px-6 py-4">{level.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Latest members who joined your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReferrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-muted p-2">
                    <Icon icon="ph:user" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{referral.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{referral.package}</p>
                  <p className={`text-xs ${referral.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
