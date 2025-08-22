import { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/auth/useAuth'
import { usePackages } from '../hooks/payments/usePackages'
import { useSiteConfig } from '../hooks/config/useSiteConfig'
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Phone, 
  Bell, 
  Search, 
  ChevronDown, 
  User, 
  Store,  
  Network, 
  ArrowDownToLine,
  Gift,
  Wallet
} from 'lucide-react'
import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
import { UserNotificationBell } from "@/components/UserNotificationBell"
import { Button } from "@/components/ui/button"
import MessageBoard from "@/pages/dashboard/MessageBoard"
// Custom utility function for conditionally joining classes
const classNames = (...classes) => classes.filter(Boolean).join(' ')

export function DashboardLayout() {
  const { 
    siteName, 
    supportPhone, 
    supportEmail, 
    supportLocation 
  } = useSiteConfig()
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)
  const { logout, user, profile } = useAuth()
  const { data: userPackage, isLoading } = usePackages()
  
  // State management
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [hoverIndex, setHoverIndex] = useState(-1)
  const [expandedProfile, setExpandedProfile] = useState(false)
  const [navAnimation, setNavAnimation] = useState(false)

  // Effect for handling window resize
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

  // Logout handling
  const handleLogout = async () => {
    setNavAnimation(true);
    setTimeout(async () => {
      try {
        await logout();
     
      } catch (error) {
        toast.error(error.message);
      }
      setNavAnimation(false);
    }, 800);
  }

  // Nav animation on route change
  const handleNavClick = (path) => {
    if (path === location.pathname) return
    setNavAnimation(true)
    setTimeout(() => {
      navigate(path)
      setNavAnimation(false)
      if (isMobile) setIsMobileOpen(false)
    }, 500)
  }




  // Navigation menu items - Mineral Trading themed
  const menuItems = [
    {
      to: '/dashboard',
      icon: LayoutDashboard,
      label: 'Mine Hub',
    },
    {
      to: '/dashboard/packages',
      icon: Store,
      label: 'My Store',
    },
    {
      to: '/dashboard/network',
      icon: Network,
      label: 'Referrals',
    },
    {
      to: '/dashboard/commissions',
      icon: DollarSign,
      label: 'Commissions',
    },
    {
      to: '/dashboard/prizes',
      icon: Gift,
      label: 'Rewards',
    },
    {
      to: '/dashboard/withdrawals',
      icon: Wallet,
      label: 'Withdrawals',
    },
    {
      to: '/dashboard/support',
      icon: Phone,
      label: 'Support',
    },
    {
      to: '/dashboard/profile',
      icon: Settings,
      label: 'Profile',
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 shadow-lg"></div>
          <div className="mt-4 h-3 w-32 bg-gray-200 rounded-full"></div>
          <div className="mt-2 h-2 w-24 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    )
  }




  // Gamified Mineral Trading Dashboard Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-amber-900 relative overflow-x-hidden font-sans">
      {/* Game-style Sidebar Navigation */}
      <aside
        className={classNames(
          "hidden md:flex fixed top-0 left-0 z-30 h-full flex-col py-6 px-3 bg-gradient-to-b from-amber-100/80 to-orange-100/80 backdrop-blur-sm shadow-xl border-r border-amber-200/50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-amber-200 hover:bg-amber-300 rounded-full items-center justify-center shadow-md transition-colors z-40"
        >
          <Menu className={classNames(
            "h-3 w-3 text-amber-700 transition-transform duration-300",
            isCollapsed ? "rotate-180" : ""
          )} />
        </button>
        {/* Logo */}
        <Link to="/dashboard" className="mb-8 flex items-center justify-center group px-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 shadow-lg grid place-items-center group-hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            <span className="text-white text-lg font-bold relative z-10">⛏️</span>
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-xl font-bold text-amber-800 tracking-tight transition-opacity duration-300">Mineral Traders</span>
          )}
        </Link>
        {/* Navigation - Game style */}
        <nav className="flex-1 flex flex-col gap-2 w-full">
          {menuItems.map((item, idx) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={classNames(
                "group flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-left relative overflow-hidden",
                location.pathname === item.to 
                  ? "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 shadow-md transform scale-105" 
                  : "text-amber-700 hover:bg-amber-100/50 hover:text-amber-800 hover:scale-102"
              )}
            >
              {location.pathname === item.to && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-xl"></div>
              )}
              <span className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors relative z-10">
                <item.icon className={classNames(
                  "h-5 w-5 transition-colors",
                  location.pathname === item.to ? "text-amber-700" : "text-amber-600 group-hover:text-amber-700"
                )} />
              </span>
              {!isCollapsed && (
                <span className="ml-3 text-sm font-semibold transition-colors relative z-10 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </nav>
        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-amber-200/50">
          <div className="flex items-center px-2 py-3">
            {(() => {
              const avatarUrl = profile?.avatar || user?.avatar || user?.photo || user?.profileImage
              const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User'
              const initials = name.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join('') || 'U'
              return (
                <>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover border-2 border-amber-300" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-amber-800 grid place-items-center text-sm font-bold border-2 border-amber-300">{initials}</div>
                  )}
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0 transition-opacity duration-300">
                      <p className="text-sm font-semibold text-amber-800 truncate">{name}</p>
                      <p className="text-xs text-amber-600">Mine Operator</p>
                    </div>
                  )}
                  {!isCollapsed && (
                    <button 
                      onClick={handleLogout}
                      className="ml-2 p-2 rounded-full bg-red-500 text-white hover:text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <LogOut className="h-6 w-6" />
                    </button>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </aside>

      {/* Mobile Navigation Drawer (opened from header hamburger) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[82vw] max-w-sm bg-white shadow-2xl border-r border-gray-200 p-6 flex flex-col animate-in slide-in-from-left duration-300 ease-out">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 shadow-lg grid place-items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                  <span className="text-white text-lg font-bold relative z-10">⛏️</span>
                </div>
                <span className="text-xl font-bold text-amber-800">MineralCo</span>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.to}>
                    <button
                      onClick={() => { handleNavClick(item.to); setIsMobileOpen(false) }}
                      className={classNames(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 relative overflow-hidden",
                        location.pathname === item.to 
                          ? "bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 border-l-4 border-amber-500 shadow-md" 
                          : "text-amber-700 hover:bg-amber-100/50 hover:text-amber-800"
                      )}
                    >
                      {location.pathname === item.to && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-xl"></div>
                      )}
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg relative z-10">
                        <item.icon className={classNames(
                          "h-5 w-5", 
                          location.pathname === item.to ? "text-amber-700" : "text-amber-600"
                        )} />
                      </span>
                      <span className="font-semibold relative z-10">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="pt-6 border-t border-amber-200/50 mt-6">
              {(() => {
                const avatarUrl = profile?.avatar || user?.avatar || user?.photo || user?.profileImage
                const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User'
                const initials = name.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join('') || 'U'
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover border-2 border-amber-300" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-amber-800 grid place-items-center text-sm font-bold border-2 border-amber-300">{initials}</div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-amber-800 truncate max-w-[30vw]">{name}</span>
                        <span className="text-xs text-amber-600">Mine Operator</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="ml-2 p-2 rounded-full bg-red-500 text-white hover:text-amber-800 hover:bg-amber-100 transition-colors"
                    >
                      <LogOut className="h-6 w-6" />
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={classNames(
        "min-h-screen transition-all duration-300 pb-24 md:pb-0",
        isCollapsed ? "md:pl-16" : "md:pl-64"
      )}>
        {/* Game-style Header */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-amber-100/80 to-orange-100/80 backdrop-blur-sm border-b border-amber-200/50 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-amber-200/50 text-amber-700 hover:text-amber-800 hover:bg-amber-200 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Welcome message */}
            <div className="hidden md:block">
              <h2 className="text-lg font-bold text-amber-800">Welcome back, {user?.firstName || 'Miner'}!</h2>
              <p className="text-sm text-amber-600">Ready to explore the mines today?</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <UserNotificationBell />
            <MessageBoard interval={4500} />
          </div>
        </header>

        {/* Main content area */}
        <div className="relative min-h-[calc(100vh-4rem)]">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}