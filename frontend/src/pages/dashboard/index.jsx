export function DashboardPage() {
  // Placeholder data (replace with hooks when available)
  const kpis = [
    { label: 'Total Earnings', value: '$0.00', delta: '+0%' },
    { label: 'Mineral Balance', value: '$0.00', delta: '—' },
    { label: 'Network Size', value: '0', delta: '+0' },
    { label: 'Active Package', value: 'None', delta: '—' },
  ]
  const minerals = [
    { icon: '🥇', name: 'Gold', grade: '24K', qty: '0.00 g', yield: '0.00/day', value: '$0.00' },
    { icon: '💎', name: 'Diamond', grade: 'VVS1', qty: '0.00 ct', yield: '0.00/day', value: '$0.00' },
    { icon: '🔋', name: 'Lithium', grade: 'Battery', qty: '0.00 kg', yield: '0.00/day', value: '$0.00' },
  ]
  const activities = [
    { icon: '⬇️', title: 'No activity yet', meta: 'Start by activating a package', amount: '' },
  ]

  return (
    <div className="relative mx-auto max-w-6xl py-6 px-3 sm:px-4 overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-10 h-72 w-72 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-amber-500/35 via-emerald-400/25 to-slate-500/20" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-400/25 via-amber-400/25 to-slate-400/20" />
      </div>

      {/* Gradient Hero */}
      <div className="relative mb-6 rounded-2xl p-[1px] bg-gradient-to-r from-amber-500/40 via-emerald-400/30 to-slate-500/30">
        <div className="rounded-2xl bg-white/90 backdrop-blur p-5">
          <h1 className="text-2xl font-light tracking-wide text-slate-900">Dashboard</h1>
          <p className="text-slate-600 text-sm mt-1">Your minerals, earnings, and activity at a glance.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl p-[1px] bg-gradient-to-br from-amber-500/30 via-emerald-400/20 to-slate-400/10">
            <div className="rounded-[11px] border border-white/40 bg-white/90 backdrop-blur-sm shadow-sm p-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="tracking-wide text-xs font-medium text-slate-700">{k.label}</h3>
                <span className="text-[11px] text-amber-700">{k.delta}</span>
              </div>
              <div className="text-2xl font-semibold text-slate-900">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Minerals + Chart */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Minerals Panel */}
        <div className="lg:col-span-2 rounded-2xl p-[1px] bg-gradient-to-br from-amber-500/25 via-emerald-400/20 to-slate-400/10">
          <div className="rounded-[15px] bg-white/95 shadow-sm border border-white/40">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-slate-900">Minerals</h2>
              <p className="text-xs text-slate-600">Holdings, grades, daily yield, and value</p>
            </div>
            <div className="hidden sm:flex gap-2">
              <button className="h-9 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm">Deposit</button>
              <button className="h-9 px-3 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 text-sm">Withdraw</button>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {minerals.map((m) => (
              <div key={m.name} className="p-4 flex items-center gap-3">
                <div className="text-xl" aria-hidden>{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-slate-900 font-medium">{m.name}</span>
                    <span className="text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5">{m.grade}</span>
                  </div>
                  <div className="text-xs text-slate-600">Daily yield: {m.yield}</div>
                </div>
                <div className="text-sm text-slate-700 w-24 text-right">{m.qty}</div>
                <div className="text-sm font-medium text-slate-900 w-24 text-right">{m.value}</div>
              </div>
            ))}
          </div>
          {/* Empty state hint */}
          <div className="p-4 text-xs text-slate-600">Activate a package to start accumulating minerals.</div>
          </div>
        </div>

        {/* Minimal Area Chart */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-br from-emerald-400/25 via-amber-400/20 to-slate-400/10">
          <div className="rounded-[15px] border border-white/40 bg-white/95 shadow-sm p-4">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-medium text-slate-900">Earnings (7d)</h2>
            <span className="text-xs text-slate-500">Placeholder</span>
          </div>
          <svg viewBox="0 0 200 80" className="w-full h-28" aria-hidden>
            <defs>
              <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,70 L0,70 L30,65 L60,66 L90,64 L120,63 L150,62 L180,61 L200,60 L200,80 L0,80 Z" fill="url(#area)" />
            <path d="M0,70 L30,65 L60,66 L90,64 L120,63 L150,62 L180,61 L200,60" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <g>
              {[0,30,60,90,120,150,180].map((x) => (
                <line key={x} x1={x} y1={60} x2={x} y2={80} stroke="#e5e7eb" />
              ))}
            </g>
          </svg>
          <p className="text-xs text-slate-600">Your earnings will appear here once you start earning.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-2xl p-[1px] bg-gradient-to-r from-amber-500/25 via-emerald-400/20 to-slate-400/10">
        <div className="rounded-[15px] bg-white/95 shadow-sm border border-white/40">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-base font-medium text-slate-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {activities.map((a, idx) => (
            <div key={idx} className="p-4 flex items-center gap-3">
              <div className="text-lg" aria-hidden>{a.icon}</div>
              <div className="flex-1">
                <div className="text-slate-900 text-sm">{a.title}</div>
                <div className="text-xs text-slate-600">{a.meta}</div>
              </div>
              {a.amount ? <div className="text-sm font-medium text-slate-900">{a.amount}</div> : null}
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}
