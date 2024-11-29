export function TicketsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Ticket Management</h1>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">Support Tickets</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all support tickets
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search tickets..."
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <select className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                <option>All Categories</option>
                <option>Technical</option>
                <option>Billing</option>
                <option>Account</option>
              </select>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Ticket ID</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4" colSpan="7">
                    No tickets found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 0 of 0 tickets
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
  )
}
