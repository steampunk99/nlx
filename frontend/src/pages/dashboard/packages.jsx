import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icon } from '@iconify/react'
import { Package, Check } from 'lucide-react'

// Sample data - replace with actual API calls
const activePackages = [
  {
    id: "PKG001",
    name: "Gold Package",
    amount: "$1,000",
    purchaseDate: "2024-01-10",
    expiryDate: "2025-01-10",
    status: "active",
    returns: "+$100",
    nextPayout: "2024-01-17"
  },
  {
    id: "PKG002",
    name: "Silver Package",
    amount: "$500",
    purchaseDate: "2024-01-05",
    expiryDate: "2025-01-05",
    status: "active",
    returns: "+$45",
    nextPayout: "2024-01-17"
  }
]

const availablePackages = [
  {
    name: "Bronze Package",
    price: "$100",
    duration: "12 months",
    returns: "8% monthly",
    features: [
      "5% Direct Referral Bonus",
      "3% Binary Bonus",
      "Basic Support",
      "Monthly Payouts"
    ]
  },
  {
    name: "Silver Package",
    price: "$500",
    duration: "12 months",
    returns: "10% monthly",
    features: [
      "7% Direct Referral Bonus",
      "5% Binary Bonus",
      "Priority Support",
      "Bi-weekly Payouts"
    ]
  },
  {
    name: "Gold Package",
    price: "$1,000",
    duration: "12 months",
    returns: "12% monthly",
    features: [
      "10% Direct Referral Bonus",
      "7% Binary Bonus",
      "VIP Support",
      "Weekly Payouts",
      "Exclusive Training"
    ]
  }
]

export default function PackagesPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Investment Packages</h1>
      </div>

      {/* Active Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Active Packages</CardTitle>
          <CardDescription>Your current investment packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Purchase Date</th>
                  <th className="px-6 py-3">Expiry Date</th>
                  <th className="px-6 py-3">Returns</th>
                  <th className="px-6 py-3">Next Payout</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {activePackages.map((pkg) => (
                  <tr key={pkg.id} className="border-b">
                    <td className="px-6 py-4 font-medium">{pkg.name}</td>
                    <td className="px-6 py-4">{pkg.amount}</td>
                    <td className="px-6 py-4">{pkg.purchaseDate}</td>
                    <td className="px-6 py-4">{pkg.expiryDate}</td>
                    <td className="px-6 py-4 text-green-500">{pkg.returns}</td>
                    <td className="px-6 py-4">{pkg.nextPayout}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Available Packages */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availablePackages.map((pkg, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>Investment Package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-3xl font-bold">{pkg.price}</div>
                <p className="text-sm text-muted-foreground">{pkg.duration}</p>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-500">{pkg.returns}</div>
                <p className="text-sm text-muted-foreground">Expected Returns</p>
              </div>
              <div className="space-y-2">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                Choose Plan
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
