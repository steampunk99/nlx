import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { DollarSign, Users, ArrowUpRight, Download } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

// Sample data - replace with actual API calls
const commissionStats = [
  {
    title: "Total Commissions",
    value: "$5,240",
    description: "Lifetime earnings from commissions",
    icon: DollarSign,
    trend: "+$850 this month",
    color: "text-green-500"
  },
  {
    title: "Direct Commissions",
    value: "$3,120",
    description: "Earnings from direct referrals",
    icon: Users,
    trend: "+$420 this month",
    color: "text-blue-500"
  },
  {
    title: "Binary Commissions",
    value: "$2,120",
    description: "Earnings from binary structure",
    icon: DollarSign,
    trend: "+$330 this month",
    color: "text-purple-500"
  }
]

const commissionHistory = [
  {
    id: "COM001",
    type: "Direct Referral",
    amount: "+$250",
    from: "John Doe",
    package: "Gold Package",
    date: "2024-01-15",
    status: "paid"
  },
  {
    id: "COM002",
    type: "Binary Bonus",
    amount: "+$180",
    from: "Network Growth",
    package: "Weekly Payout",
    date: "2024-01-14",
    status: "paid"
  },
  {
    id: "COM003",
    type: "Direct Referral",
    amount: "+$150",
    from: "Jane Smith",
    package: "Silver Package",
    date: "2024-01-13",
    status: "pending"
  }
]

export default function CommissionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Commissions</h1>
        <div className="flex items-center space-x-4">
          <Select defaultValue="all-time">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Commission Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {commissionStats.map((stat, index) => (
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

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>Detailed history of your commission earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">From</th>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissionHistory.map((commission) => (
                  <tr key={commission.id} className="border-b">
                    <td className="px-6 py-4 font-medium">{commission.id}</td>
                    <td className="px-6 py-4">{commission.type}</td>
                    <td className="px-6 py-4">{commission.from}</td>
                    <td className="px-6 py-4">{commission.package}</td>
                    <td className="px-6 py-4">{commission.date}</td>
                    <td className="px-6 py-4 text-green-500 font-medium">{commission.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        commission.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
