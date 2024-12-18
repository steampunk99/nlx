import { TrendingUp, Users, Network } from "lucide-react"

export function StatsSection() {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          title="Potential ROI"
          value="Up to 300%"
          color="green"
        />
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-500" />}
          title="Active Investors"
          value="1,000+"
          color="blue"
        />
        <StatCard
          icon={<Network className="w-6 h-6 text-purple-500" />}
          title="Network Growth"
          value="Unlimited"
          color="purple"
        />
      </div>
    )
  }
  
  function StatCard({ icon, title, value, color }) {
    return (
      <div className={`p-6 rounded-2xl bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border border-${color}-500/20`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-${color}-500/20`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold text-${color}-500`}>{value}</p>
          </div>
        </div>
      </div>
    )
  }