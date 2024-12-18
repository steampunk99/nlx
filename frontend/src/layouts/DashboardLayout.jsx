import { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useToast } from '../components/ui/use-toast'
import { useAuth } from '../hooks/useAuth'
import { cn } from "../lib/utils"
import { 
  LayoutDashboard, 
  Network, 
  DollarSign, 
  Package, 
  Wallet, 
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import { DashboardFooter } from '@/components/dashboard/DashboardFooter'

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { logout, user } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      if (newIsMobile !== isMobile) {
        setIsCollapsed(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  const handleLogout = async () => {
    try {
      await logout()
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      })
      
      navigate('/login')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to logout",
      })
    }
  }

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/network', icon: Network, label: 'Network' },
    { to: '/dashboard/commissions', icon: DollarSign, label: 'Commissions' },
    { to: '/dashboard/packages', icon: Package, label: 'Packages' },
    { to: '/dashboard/withdrawals', icon: Wallet, label: 'Withdrawals' },
    
    { to: '/dashboard/profile', icon: Settings, label: 'Settings' },
  ]

  const SidebarContent = ({ isMobileView = false }) => (
    <>
      <div className={cn(
        "flex h-14 items-center border-b border-white/10 px-6",
        isCollapsed && !isMobileView && "justify-center px-0"
      )}>
        {(!isCollapsed || isMobileView) && (
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-white">Zillionaire</span>
          </Link>
        )}
      </div>
      
      <div className={cn(
        "p-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-purple-500/10",
        isCollapsed && !isMobileView && "p-2"
      )}>
        <div className="space-y-3">
          <div className={cn(
            "flex items-center",
            isCollapsed && !isMobileView ? "justify-center" : "space-x-3"
          )}>
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white/20">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {(!isCollapsed || isMobileView) && (
              <div>
                <p className="text-sm font-semibold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400">@{user?.username}</p>
              </div>
            )}
          </div>
          {(!isCollapsed || isMobileView) && (
            <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">
                Active
              </span>
         
    
            </div>
          )}
        </div>
      </div>

      <nav className={cn("space-y-1 p-4", isCollapsed && !isMobileView && "p-2")}>
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors",
              isCollapsed && !isMobileView ? "justify-center px-0" : "space-x-2",
              location.pathname === item.to && "bg-white/10 text-white"
            )}
            title={isCollapsed && !isMobileView ? item.label : undefined}
            onClick={isMobileView ? () => setIsMobileOpen(false) : undefined}
          >
            <item.icon className="h-4 w-4" />
            {(!isCollapsed || isMobileView) && <span>{item.label}</span>}
          </Link>
        ))}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-gray-300 hover:text-white hover:bg-white/10",
            isCollapsed && !isMobileView ? "px-0 justify-center" : "justify-start"
          )}
          onClick={handleLogout}
          title={isCollapsed && !isMobileView ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {(!isCollapsed || isMobileView) && <span className="ml-2">Logout</span>}
        </Button>
      </nav>

      {!isMobileView && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-purple-500 text-white border border-white/20 shadow-lg hover:from-yellow-600 hover:to-purple-600 transition-all"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      )}
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className={cn(
          "fixed inset-y-0 left-0 border-r transition-all duration-300 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800",
          isCollapsed ? "w-16" : "w-64"
        )}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 px-4 lg:hidden">
          <Button
            variant="ghost"
            className="text-gray-300"
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1">
            <span className="font-bold text-white">Zillionaire</span>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800">
            <SheetHeader className="p-4 text-left">
              <SheetTitle className="text-white">Dashboard</SheetTitle>
            </SheetHeader>
            <SidebarContent isMobileView />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content */}
      <main className={cn(
        "transition-all duration-300 bg-gray-50",
        !isMobile && (isCollapsed ? "pl-16" : "pl-64"),
        isMobile && "pl-0"
      )}>
        <div className="container py-6">
          <Outlet />
          <DashboardFooter />
        </div>
      </main>
    </div>
  )
}
