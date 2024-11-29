export function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Earnings</h3>
          </div>
          <div className="text-2xl font-bold">$0.00</div>
          <p className="text-xs text-muted-foreground">
            +0% from last month
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Network Size</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            +0 new members this month
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Package</h3>
          </div>
          <div className="text-2xl font-bold">None</div>
          <p className="text-xs text-muted-foreground">
            Upgrade to start earning
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
        <div className="mt-4">
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      </div>
    </div>
  )
}
