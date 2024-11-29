export function AdminPackagesPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Package Management</h1>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Investment Packages</h2>
              <p className="text-sm text-muted-foreground">
                Manage available investment packages
              </p>
            </div>
            <button className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
              Add Package
            </button>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Direct Bonus</th>
                  <th className="px-6 py-3">Binary Bonus</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4">Starter</td>
                  <td className="px-6 py-4">$100</td>
                  <td className="px-6 py-4">5%</td>
                  <td className="px-6 py-4">3%</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">Professional</td>
                  <td className="px-6 py-4">$500</td>
                  <td className="px-6 py-4">7%</td>
                  <td className="px-6 py-4">5%</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4">Elite</td>
                  <td className="px-6 py-4">$1000</td>
                  <td className="px-6 py-4">10%</td>
                  <td className="px-6 py-4">7%</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPackagesPage
