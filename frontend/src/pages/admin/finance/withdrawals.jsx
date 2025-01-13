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
import { Icon } from '@iconify/react';

const withdrawals = [
  {
    id: "WD001",
    user: "John Doe",
    amount: "$1,500",
    method: "Bank Transfer",
    status: "pending",
    date: "2024-01-20",
    accountDetails: "**** 1234"
  },
  {
    id: "WD002",
    user: "Jane Smith",
    amount: "$2,800",
    method: "Crypto",
    status: "completed",
    date: "2024-01-19",
    accountDetails: "0x1234...5678"
  },
  {
    id: "WD003",
    user: "Mike Johnson",
    amount: "$950",
    method: "PayPal",
    status: "processing",
    date: "2024-01-18",
    accountDetails: "mike@email.com"
  },
  {
    id: "WD004",
    user: "Sarah Wilson",
    amount: "$3,200",
    method: "Bank Transfer",
    status: "completed",
    date: "2024-01-17",
    accountDetails: "**** 5678"
  }
]

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  processing: "bg-blue-50 text-blue-700",
  failed: "bg-red-50 text-red-700"
}

export default function WithdrawalsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
          <p className="text-sm text-gray-500">Manage user withdrawal requests</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <Icon icon="ph:money-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-gray-500">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Icon icon="ph:clock-bold" className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,500</div>
            <p className="text-xs text-gray-500">1 withdrawal(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Icon icon="ph:arrows-clockwise-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$950</div>
            <p className="text-xs text-gray-500">1 withdrawal(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$6,000</div>
            <p className="text-xs text-gray-500">2 withdrawal(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
          <CardDescription>
            View and manage withdrawal requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">{withdrawal.id}</TableCell>
                  <TableCell>{withdrawal.user}</TableCell>
                  <TableCell>{withdrawal.amount}</TableCell>
                  <TableCell>{withdrawal.method}</TableCell>
                  <TableCell>{withdrawal.accountDetails}</TableCell>
                  <TableCell>{withdrawal.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[withdrawal.status]
                    }`}>
                      {withdrawal.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:eye-bold" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:x-circle-bold" className="h-4 w-4 text-red-500" />
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
