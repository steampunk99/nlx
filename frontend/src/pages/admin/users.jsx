export function UsersPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold tracking-tight mb-6">User Management</h1>

      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-medium">All Users</h2>
              <p className="text-sm text-muted-foreground">
                Manage and monitor user accounts
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search users..."
                className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <button className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90">
                Add User
              </button>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Package</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4" colSpan="6">
                    No users found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing 0 of 0 users
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

export default UsersPage
