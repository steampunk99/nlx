import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon } from '@iconify/react'

const roles = [
  {
    id: 1,
    name: "Administrator",
    description: "Full system access with all permissions",
    users: 3,
    permissions: 25,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Manager",
    description: "Access to manage users and content",
    users: 8,
    permissions: 18,
    createdAt: "2024-01-15"
  },
  {
    id: 3,
    name: "Support",
    description: "Access to handle support tickets and FAQs",
    users: 12,
    permissions: 10,
    createdAt: "2024-01-15"
  },
  {
    id: 4,
    name: "User",
    description: "Standard user access",
    users: 156,
    permissions: 5,
    createdAt: "2024-01-15"
  }
]

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-sm text-gray-500">Manage user roles and their permissions</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:plus-bold" className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            View and manage all user roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>{role.users}</TableCell>
                  <TableCell>{role.permissions}</TableCell>
                  <TableCell>{role.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:pencil-bold" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Icon icon="ph:trash-bold" className="h-4 w-4 text-red-500" />
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
