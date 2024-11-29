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

const categories = [
  {
    id: 1,
    name: "Starter Package",
    description: "Basic investment packages for beginners",
    packages: 3,
    minInvestment: "$100",
    maxInvestment: "$1,000",
    status: "active"
  },
  {
    id: 2,
    name: "Professional",
    description: "Mid-level investment packages",
    packages: 5,
    minInvestment: "$1,000",
    maxInvestment: "$10,000",
    status: "active"
  },
  {
    id: 3,
    name: "Enterprise",
    description: "High-level investment packages",
    packages: 4,
    minInvestment: "$10,000",
    maxInvestment: "$100,000",
    status: "active"
  },
  {
    id: 4,
    name: "VIP",
    description: "Exclusive investment opportunities",
    packages: 2,
    minInvestment: "$100,000",
    maxInvestment: "Unlimited",
    status: "inactive"
  }
]

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Package Categories</h1>
          <p className="text-sm text-gray-500">Manage investment package categories</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:plus-bold" className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Icon icon="ph:folders-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter(c => c.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Icon icon="ph:package-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((acc, curr) => acc + curr.packages, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Packages</CardTitle>
            <Icon icon="ph:chart-bar-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(categories.reduce((acc, curr) => acc + curr.packages, 0) / categories.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Categories</CardTitle>
          <CardDescription>
            View and manage investment package categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Packages</TableHead>
                <TableHead>Min Investment</TableHead>
                <TableHead>Max Investment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.packages}</TableCell>
                  <TableCell>{category.minInvestment}</TableCell>
                  <TableCell>{category.maxInvestment}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      category.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {category.status}
                    </span>
                  </TableCell>
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
