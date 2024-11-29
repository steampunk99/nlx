import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { Wallet, ArrowUpRight, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

// Sample data - replace with actual API calls
const withdrawalStats = [
  {
    title: "Available Balance",
    value: "$3,450",
    description: "Available for withdrawal",
    icon: Wallet,
    trend: "+$850 this month",
    color: "text-green-500"
  },
  {
    title: "Total Withdrawn",
    value: "$12,680",
    description: "Lifetime withdrawals",
    icon: Wallet,
    trend: "+$2,450 this month",
    color: "text-blue-500"
  }
]

const withdrawalHistory = [
  {
    id: "WTH001",
    amount: "$1,000",
    method: "Bank Transfer",
    account: "****1234",
    date: "2024-01-15",
    status: "completed",
    processedDate: "2024-01-16"
  },
  {
    id: "WTH002",
    amount: "$500",
    method: "Bitcoin",
    account: "3FZbgi29...",
    date: "2024-01-14",
    status: "processing",
    processedDate: null
  },
  {
    id: "WTH003",
    amount: "$750",
    method: "Bank Transfer",
    account: "****5678",
    date: "2024-01-13",
    status: "completed",
    processedDate: "2024-01-14"
  }
]

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Withdrawals</h1>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="mr-2 h-4 w-4" />
          New Withdrawal
        </button>
      </div>

      {/* Withdrawal Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {withdrawalStats.map((stat, index) => (
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

      {/* Withdrawal Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Methods</CardTitle>
          <CardDescription>Your saved withdrawal methods</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-muted p-2">
                <Icon icon="ph:bank" className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Bank Account</p>
                <p className="text-sm text-muted-foreground">****1234</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-muted p-2">
                <Icon icon="ph:currency-btc" className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Bitcoin Wallet</p>
                <p className="text-sm text-muted-foreground">3FZbgi29...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your recent withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Account</th>
                  <th className="px-6 py-3">Request Date</th>
                  <th className="px-6 py-3">Processed Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawalHistory.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b">
                    <td className="px-6 py-4 font-medium">{withdrawal.id}</td>
                    <td className="px-6 py-4">{withdrawal.amount}</td>
                    <td className="px-6 py-4">{withdrawal.method}</td>
                    <td className="px-6 py-4">{withdrawal.account}</td>
                    <td className="px-6 py-4">{withdrawal.date}</td>
                    <td className="px-6 py-4">{withdrawal.processedDate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
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
