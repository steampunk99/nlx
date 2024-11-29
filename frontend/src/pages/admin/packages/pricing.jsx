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
import { Switch } from "../../../components/ui/switch"
import { Icon } from '@iconify/react'

const pricingPlans = [
  {
    id: 1,
    name: "Basic Starter",
    category: "Starter Package",
    minInvestment: "$100",
    maxInvestment: "$500",
    duration: "30 days",
    roi: "5%",
    referralBonus: "2%",
    status: "active"
  },
  {
    id: 2,
    name: "Advanced Starter",
    category: "Starter Package",
    minInvestment: "$500",
    maxInvestment: "$1,000",
    duration: "60 days",
    roi: "8%",
    referralBonus: "3%",
    status: "active"
  },
  {
    id: 3,
    name: "Professional Growth",
    category: "Professional",
    minInvestment: "$1,000",
    maxInvestment: "$5,000",
    duration: "90 days",
    roi: "12%",
    referralBonus: "4%",
    status: "active"
  },
  {
    id: 4,
    name: "Enterprise Elite",
    category: "Enterprise",
    minInvestment: "$10,000",
    maxInvestment: "$50,000",
    duration: "180 days",
    roi: "20%",
    referralBonus: "5%",
    status: "inactive"
  }
]

export default function PricingPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Package Pricing</h1>
          <p className="text-sm text-gray-500">Manage investment package pricing and returns</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:plus-bold" className="h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Icon icon="ph:tag-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingPlans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Icon icon="ph:check-circle-bold" className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pricingPlans.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. ROI</CardTitle>
            <Icon icon="ph:trend-up-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(pricingPlans.reduce((acc, curr) => acc + parseFloat(curr.roi), 0) / pricingPlans.length)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Icon icon="ph:timer-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(pricingPlans.reduce((acc, curr) => acc + parseInt(curr.duration), 0) / pricingPlans.length)} days
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Plans</CardTitle>
          <CardDescription>
            View and manage investment package pricing plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Investment Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Referral</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.category}</TableCell>
                  <TableCell>{plan.minInvestment} - {plan.maxInvestment}</TableCell>
                  <TableCell>{plan.duration}</TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{plan.roi}</span>
                  </TableCell>
                  <TableCell>{plan.referralBonus}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      plan.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {plan.status}
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
