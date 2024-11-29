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
import {
  Icon
} from "../../../../node_modules/@iconify/react"

const tickets = [
  {
    id: "TKT001",
    user: "John Doe",
    subject: "Withdrawal Issue",
    category: "Payment",
    priority: "high",
    status: "open",
    lastUpdate: "2024-01-20",
    assignedTo: "Support Team A"
  },
  {
    id: "TKT002",
    user: "Jane Smith",
    subject: "Account Verification",
    category: "Account",
    priority: "medium",
    status: "in_progress",
    lastUpdate: "2024-01-19",
    assignedTo: "Support Team B"
  },
  {
    id: "TKT003",
    user: "Mike Johnson",
    subject: "Investment Package Query",
    category: "Investment",
    priority: "low",
    status: "closed",
    lastUpdate: "2024-01-18",
    assignedTo: "Support Team A"
  },
  {
    id: "TKT004",
    user: "Sarah Wilson",
    subject: "Referral Commission",
    category: "Commission",
    priority: "medium",
    status: "open",
    lastUpdate: "2024-01-17",
    assignedTo: "Unassigned"
  }
]

const statusColors = {
  open: "bg-yellow-50 text-yellow-700",
  in_progress: "bg-blue-50 text-blue-700",
  closed: "bg-gray-50 text-gray-700",
  resolved: "bg-green-50 text-green-700"
}

const priorityColors = {
  low: "bg-gray-50 text-gray-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-red-50 text-red-700"
}

export default function TicketsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-sm text-gray-500">Manage customer support tickets</p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Icon icon="ph:plus-bold" className="h-4 w-4" />
            Create Ticket
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Icon icon="ph:ticket-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-gray-500">+2 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Icon icon="ph:envelope-open-bold" className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-gray-500">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Icon icon="ph:clock-bold" className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">Being handled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-500">Resolved issues</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            View and manage all customer support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.user}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.category}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      priorityColors[ticket.priority]
                    }`}>
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell>{ticket.assignedTo}</TableCell>
                  <TableCell>{ticket.lastUpdate}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[ticket.status]
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:eye-bold" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:chat-circle-text-bold" className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
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
