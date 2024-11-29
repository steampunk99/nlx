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
import { Switch } from "@/components/ui/switch"
import { Icon } from '@iconify/react'

const permissions = [
  {
    id: 1,
    name: "User Management",
    description: "Create, edit, and delete users",
    roles: ["Administrator", "Manager"],
    type: "write",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "View Reports",
    description: "Access to analytics and reports",
    roles: ["Administrator", "Manager", "Support"],
    type: "read",
    createdAt: "2024-01-15"
  },
  {
    id: 3,
    name: "Manage Support",
    description: "Handle support tickets and inquiries",
    roles: ["Administrator", "Support"],
    type: "write",
    createdAt: "2024-01-15"
  },
  {
    id: 4,
    name: "View Content",
    description: "Access to view platform content",
    roles: ["Administrator", "Manager", "Support", "User"],
    type: "read",
    createdAt: "2024-01-15"
  }
]

export default function PermissionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-sm text-gray-500">Configure system permissions and access levels</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:plus-bold" className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Permissions</CardTitle>
          <CardDescription>
            View and manage all system permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      permission.type === 'write' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {permission.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {permission.roles.map((role, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{permission.createdAt}</TableCell>
                  <TableCell><Switch /></TableCell>
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
