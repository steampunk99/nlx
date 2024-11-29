export function AdminWithdrawalsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Withdrawal Management</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pending Withdrawals</h3>
          </div>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">0 requests</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Processed Today</h3>
          </div>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">0 withdrawals</p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Processed</h3>
          </div>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h2 className="text-lg font-medium">Withdrawal Requests</h2>
                <p className="text-sm text-muted-foreground">
                  Process pending withdrawal requests
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Requested</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-6 py-4" colSpan="6">
                      No withdrawal requests found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 0 of 0 requests
              </p>
              <div className="flex items-center space-x-2">
                <button
                  disabled
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-400"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-400"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminWithdrawalsPage
