import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Icon } from '@iconify/react'

const transactions = [
  {
    id: "TRX001",
    user: "John Doe",
    type: "deposit",
    amount: "$2,500",
    method: "Bank Transfer",
    status: "completed",
    date: "2024-01-20"
  },
  {
    id: "TRX002",
    user: "Jane Smith",
    type: "withdrawal",
    amount: "$1,800",
    method: "Crypto",
    status: "pending",
    date: "2024-01-19"
  },
  {
    id: "TRX003",
    user: "Mike Johnson",
    type: "investment",
    amount: "$5,000",
    method: "Credit Card",
    status: "completed",
    date: "2024-01-18"
  },
  {
    id: "TRX004",
    user: "Sarah Wilson",
    type: "commission",
    amount: "$350",
    method: "System",
    status: "completed",
    date: "2024-01-17"
  }
]

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700"
}

const typeColors = {
  deposit: "bg-green-50 text-green-700",
  withdrawal: "bg-yellow-50 text-yellow-700",
  investment: "bg-blue-50 text-blue-700",
  commission: "bg-purple-50 text-purple-700"
}

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500">View and manage all financial transactions</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
              <SelectItem value="investment">Investments</SelectItem>
              <SelectItem value="commission">Commissions</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Icon icon="ph:export-bold" className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Icon icon="ph:currency-circle-dollar-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9,650</div>
            <p className="text-xs text-gray-500">+12.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deposits</CardTitle>
            <Icon icon="ph:arrow-up-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,500</div>
            <p className="text-xs text-gray-500">1 transaction(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <Icon icon="ph:trend-up-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,000</div>
            <p className="text-xs text-gray-500">1 transaction(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <Icon icon="ph:percent-bold" className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$350</div>
            <p className="text-xs text-gray-500">1 transaction(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all financial transactions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      typeColors[transaction.type]
                    }`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.method}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[transaction.status]
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:eye-bold" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:receipt-bold" className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
