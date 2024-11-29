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
import { Icon } from '../../../../node_modules/@iconify/react'

const commissions = [
  {
    id: "COM001",
    user: "John Doe",
    referral: "Sarah Wilson",
    amount: "$150",
    type: "direct",
    package: "Professional Growth",
    status: "paid",
    date: "2024-01-20"
  },
  {
    id: "COM002",
    user: "Jane Smith",
    referral: "Mike Johnson",
    amount: "$75",
    type: "indirect",
    package: "Basic Starter",
    status: "pending",
    date: "2024-01-19"
  },
  {
    id: "COM003",
    user: "Mike Johnson",
    referral: "Alex Brown",
    amount: "$200",
    type: "direct",
    package: "Enterprise Elite",
    status: "paid",
    date: "2024-01-18"
  },
  {
    id: "COM004",
    user: "Sarah Wilson",
    referral: "Lisa White",
    amount: "$100",
    type: "direct",
    package: "Advanced Starter",
    status: "processing",
    date: "2024-01-17"
  }
]

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700"
}

const typeColors = {
  direct: "bg-blue-50 text-blue-700",
  indirect: "bg-purple-50 text-purple-700"
}

export default function CommissionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-sm text-gray-500">Track and manage referral commissions</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:export-bold" className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Icon icon="ph:money-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$525</div>
            <p className="text-xs text-gray-500">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
            <Icon icon="ph:users-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$450</div>
            <p className="text-xs text-gray-500">3 commission(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indirect Referrals</CardTitle>
            <Icon icon="ph:git-fork-bold" className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$75</div>
            <p className="text-xs text-gray-500">1 commission(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Icon icon="ph:clock-bold" className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$75</div>
            <p className="text-xs text-gray-500">1 commission(s)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            View all referral commissions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.id}</TableCell>
                  <TableCell>{commission.user}</TableCell>
                  <TableCell>{commission.referral}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      typeColors[commission.type]
                    }`}>
                      {commission.type}
                    </span>
                  </TableCell>
                  <TableCell>{commission.package}</TableCell>
                  <TableCell>{commission.amount}</TableCell>
                  <TableCell>{commission.date}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[commission.status]
                    }`}>
                      {commission.status}
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
