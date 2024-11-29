import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { 
  LayoutDashboard, 
  Network, 
  DollarSign, 
  Package, 
  Wallet, 
  User,
  LogOut 
} from 'lucide-react'

export function DashboardLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login')
  }

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/network', icon: Network, label: 'Network' },
    { to: '/dashboard/commissions', icon: DollarSign, label: 'Commissions' },
    { to: '/dashboard/packages', icon: Package, label: 'Packages' },
    { to: '/dashboard/withdrawals', icon: Wallet, label: 'Withdrawals' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">Zillionaire</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="pl-64">
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
