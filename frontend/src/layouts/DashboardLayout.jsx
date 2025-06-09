import { useState, useEffect, useRef } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/auth/useAuth'
import { usePackages } from '../hooks/payments/usePackages'
import { useSiteConfig } from '../hooks/config/useSiteConfig'
import { 
  LayoutDashboard, 
  Network, 
  DollarSign, 
  Package, 
  Wallet, 
  Settings,
  User2Icon,
  LogOut,
  Menu,
  X,
  Star,
  ChevronUp,
  Bell,
  BadgeMinus
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
  const { logout, user } = useAuth()
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

  // --- Farm/Cocoa SVG Icons ---
  const FarmhouseIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M3 12L12 4l9 8" stroke="#4e3b1f" strokeWidth="2"/><rect x="6" y="12" width="12" height="8" rx="2" fill="#ffe066" stroke="#b6d7b0" strokeWidth="2"/><rect x="10" y="15" width="4" height="5" rx="1" fill="#b6d7b0"/></svg>
  );
  const FarmersIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="8" cy="8" r="4" fill="#b6d7b0" stroke="#4e3b1f" strokeWidth="2"/><circle cx="16" cy="8" r="4" fill="#ffe066" stroke="#4e3b1f" strokeWidth="2"/><rect x="2" y="16" width="20" height="6" rx="3" fill="#e6f2ef" stroke="#b6d7b0" strokeWidth="2"/></svg>
  );



// Withdraw Icon
const WithdrawIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
    <rect x="4" y="17" width="16" height="4" rx="1" />
  </svg>
);

// Commissions Icon (percentage symbol)
const CommissionsIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

// Support Icon (chat bubble)
const SupportIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 3 12a8.5 8.5 0 0 1 14.1-6.4" />
    <path d="M22 4l-10 10" />
  </svg>
);

// Settings Icon (gear)
const SettingsIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09A1.65 1.65 0 0 0 9 3.09V3a2 2 0 1 1 4 0v.09c.39.14.75.36 1 .67a1.65 1.65 0 0 0 1.51.33h.09a1.65 1.65 0 0 0 1-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09c-.17.63-.52 1.22-1.01 1.71z" />
  </svg>
);

// Profile Icon (user silhouette)
const ProfileIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

// Logout Icon
const LogoutIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);


  const GiftIcon = (props) => (
    <svg width="120" height="120" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" stroke-width="2">
  <rect x="12" y="24" width="40" height="28" fill="#FF4F64" stroke="#B00020"/>
  <rect x="10" y="18" width="44" height="10" fill="#FF6F91" stroke="#B00020"/>
  <rect x="30" y="18" width="4" height="34" fill="#FFD700" stroke="none"/>
  <rect x="10" y="32" width="44" height="4" fill="#FFD700" stroke="none"/>
  <circle cx="32" cy="18" r="4" fill="#FFD700" stroke="#B00020"/>
  <path d="M28 18 C24 14, 20 14, 18 18" fill="#FFD700" stroke="#B00020"/>
  <path d="M36 18 C40 14, 44 14, 46 18" fill="#FFD700" stroke="#B00020"/>
</svg>

  )
  // Navigation menu items (renamed, new icons)
  const menuItems = [
    {
      to: '/dashboard',
      icon: FarmhouseIcon,
      label: 'Farmhouse',
      color: 'from-green-600 to-lime-400',
      bgColor: 'from-green-700/20 to-lime-400/20',
      hoverColor: 'from-green-700 to-lime-400',
    },
    {
      to: '/dashboard/network',
      icon: FarmersIcon,
      label: 'Farmers',
      color: 'from-amber-600 to-yellow-400',
      bgColor: 'from-amber-700/20 to-yellow-400/20',
      hoverColor: 'from-amber-700 to-yellow-400',
    },
    {
      to: '/dashboard/commissions',
      icon: CommissionsIcon,
      label: 'Commissions',
      color: 'from-orange-600 to-yellow-400',
      bgColor: 'from-orange-700/20 to-yellow-400/20',
      hoverColor: 'from-orange-700 to-yellow-400',
    },
    {
      to: '/dashboard/prizes',
      icon: GiftIcon,
      label: 'Prizes',
      color: 'from-yellow-600 to-amber-400',
      bgColor: 'from-yellow-700/20 to-amber-400/20',
      hoverColor: 'from-yellow-700 to-amber-400',
    },
    {
      to: '/dashboard/withdrawals',
      icon: WithdrawIcon,
      label: 'Withdraw',
      color: 'from-lime-600 to-green-400',
      bgColor: 'from-lime-700/20 to-green-400/20',
      hoverColor: 'from-lime-700 to-green-400',
    },
    {
      to: '/dashboard/support',
      icon: SupportIcon,
      label: 'Support',
      color: 'from-gray-500 to-slate-400',
      bgColor: 'from-gray-600/20 to-slate-500/20',
      hoverColor: 'from-gray-600 to-slate-500',
    },
    
    {
      to: '/dashboard/profile',
      icon: SettingsIcon,
      label: 'Settings',
      color: 'from-gray-500 to-slate-400',
      bgColor: 'from-gray-600/20 to-slate-500/20',
      hoverColor: 'from-gray-600 to-slate-500',
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500"></div>
          <div className="mt-4 h-2 w-24 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }




  // --- Redesigned Responsive Cocoa-Themed Dashboard Layout with Enhanced Top Bar and Creative Mobile Nav ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] text-[#2c2c2c] relative overflow-x-hidden font-sans">
      {/* Responsive Sidebar Navigation (hidden on mobile) */}
      <aside
        className={classNames(
          "hidden md:flex fixed top-0 left-0 z-30 h-full flex-col items-center py-8 px-2 bg-gradient-to-b from-[#e6f2ef] to-[#b6d7b0] shadow-xl border-r border-[#b6d7b0]/30 transition-all duration-500",
          "w-20 lg:w-28 xl:w-40"
        )}
      >
        {/* Cocoa Pod Logo */}
        <Link to="/dashboard" className="mb-8 flex flex-col items-center group">
          <img src="https://static.vecteezy.com/system/resources/previews/042/125/124/non_2x/cacao-beans-with-leaves-isolated-on-transparent-background-with-clipping-path-3d-render-free-png.png" alt="Cocoa Pod" className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-4 border-[#fffbe6] shadow-lg group-hover:scale-110 transition-transform duration-200" />
          <span className="mt-2 text-base lg:text-lg font-cursive text-[#4e3b1f] tracking-tight" style={{fontFamily:'Pacifico, cursive'}}>My Farm</span>
        </Link>
        {/* Navigation - farm plot style */}
        <nav className="flex-1 flex flex-col gap-4 items-center w-full mt-4">
          {menuItems.map((item, idx) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={classNames(
                "group flex flex-col items-center w-full py-2 rounded-2xl transition-all duration-300 hover:bg-[#fffbe6]/60 hover:shadow-lg",
                location.pathname === item.to ? "bg-[#fffbe6] shadow-lg" : "bg-transparent"
              )}
            >
              <span className="flex items-center justify-center w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-[#b6d7b0] to-[#e6f2ef] mb-1 group-hover:scale-110 transition-transform">
                <item.icon className={classNames("h-5 w-5 lg:h-6 lg:w-6", location.pathname === item.to ? "text-[#4e3b1f]" : "text-[#2c5f63]")} />
              </span>
              <span className="text-[10px] lg:text-xs font-semibold text-[#4e3b1f] group-hover:text-[#2c5f63] transition-colors text-center">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        {/* Plant Cocoa CTA */}
        <Button
          onClick={() => handleLogout()}
          className="mt-8 w-11/12 bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] text-[#4e3b1f] font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform text-xs lg:text-base py-2 lg:py-3"
        >
          <span className="flex items-center gap-2 justify-center">
            <span className="text-lg">🌱</span> Logout
          </span>
        </Button>
      </aside>

      {/* Creative Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-between items-end px-0 pb-2 pt-0 bg-gradient-to-t from-[#ffe066]/90 via-[#b6d7b0]/90 to-[#e6f2ef]/90 shadow-2xl rounded-t-3xl border-t-2 border-[#ffe066]/40">
        {/* Floating cocoa pod centerpiece */}
        <div className="absolute left-1/2 -top-12 animate-pulse -translate-x-1/2 z-10 flex flex-col items-center">
          <button
            onClick={() => handleNavClick('/dashboard/prizes')}
            className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] shadow-lg rounded-full w-16 h-16 flex items-center justify-center border-4 border-white hover:scale-110 transition-transform"
            style={{ boxShadow: '0 4px 24px 0 #ffe06655' }}
          >
            <GiftIcon className="h-6 w-6" />
          </button>
        </div>
        {/* Nav items, spaced around centerpiece (omit 'Barn' on mobile) */}
        <div className="flex flex-1 justify-evenly items-end gap-1">
          {menuItems.slice(0, 3).map((item, idx) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={classNames(
                "flex flex-col items-center px-2 py-2 rounded-xl transition-all duration-200",
                location.pathname === item.to ? "bg-[#fffbe6]/80 shadow" : "bg-transparent"
              )}
            >
              <item.icon className={classNames("h-6 w-6", location.pathname === item.to ? "text-[#4e3b1f]" : "text-[#2c5f63]")} />
              <span className="text-[11px] font-semibold mt-1 text-[#4e3b1f]">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-1 justify-evenly items-end gap-1">
          {/* Only show menuItems 4 and 5 (skip 'Barn' which is index 3) */}
          {menuItems.slice(4).map((item, idx) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={classNames(
                "flex flex-col items-center px-2 py-2 rounded-xl transition-all duration-200",
                location.pathname === item.to ? "bg-[#fffbe6]/80 shadow" : "bg-transparent"
              )}
            >
              <item.icon className={classNames("h-6 w-6", location.pathname === item.to ? "text-[#4e3b1f]" : "text-[#2c5f63]")} />
              <span className="text-[11px] font-semibold mt-1 text-[#4e3b1f]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area with farm illustration */}
      <main className={classNames(
        "min-h-screen transition-all duration-500 md:pl-20 lg:pl-28 xl:pl-40 pb-24 md:pb-0",
      )}>
        {/* Enhanced Top Bar - farm sky, more visual, more info */}
        <header className="h-20 z-100 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-[#ffe066]/60 via-[#b6d7b0]/60 to-[#e6f2ef]/60 border-b-2 border-[#ffe066]/30 shadow-md relative rounded-b-3xl">
          
         
          <div className="flex w-full items-center gap-2 md:gap-4">
            <UserNotificationBell />
            <MessageBoard interval={4500} />
            <button onClick={handleLogout} className="text-red-600 border border-red-800 hover:text-red-300 hover:bg-red-100/60 rounded-xl px-3 md:px-4 text-xs md:text-base">
              <LogoutIcon className="h-5 w-5 mr-1 p-1" /> 
            </button>
          </div>
        </header>

        {/* Farm field illustration background */}
        <div className="relative min-h-[calc(100vh-5rem)]">
          <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <ellipse cx="720" cy="320" rx="720" ry="80" fill="#b6d7b0" />
            <ellipse cx="200" cy="300" rx="180" ry="60" fill="#e6f2ef" />
            <ellipse cx="1240" cy="310" rx="200" ry="70" fill="#ffe066" />
            {/* Cocoa trees */}
            {[320, 1120, 600, 900].map((x, i) => (
              <g key={x}>
                <rect x={x} y={220} width="16" height="60" rx="7" fill="#8d6748"/>
                <ellipse cx={x+8} cy={220} rx="28" ry="18" fill="#4e7c3a"/>
                <ellipse cx={x+8} cy={220} rx="14" ry="9" fill="#7bb661"/>
                <ellipse cx={x+18} cy={240} rx="5" ry="10" fill="#c97c3a"/>
              </g>
            ))}
          </svg>
          <div className="relative z-10 p-3 md:p-6 lg:p-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}