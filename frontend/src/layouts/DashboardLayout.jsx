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
  LogOut,
  Menu,
  X,
  Star,
  ChevronUp,
  Bell
} from 'lucide-react'
import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
import { UserNotificationBell } from "@/components/UserNotificationBell"
import { Button } from "@/components/ui/button"

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
  const HarvestIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><ellipse cx="12" cy="12" rx="8" ry="5" fill="#b6d7b0" stroke="#4e3b1f" strokeWidth="2"/><ellipse cx="12" cy="12" rx="4" ry="2.5" fill="#ffe066" stroke="#4e3b1f" strokeWidth="1.5"/></svg>
  );
  const BarnIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><rect x="4" y="10" width="16" height="10" rx="2" fill="#ffe066" stroke="#4e3b1f" strokeWidth="2"/><rect x="9" y="15" width="6" height="5" rx="1" fill="#b6d7b0"/><path d="M2 12L12 4l10 8" stroke="#b6d7b0" strokeWidth="2"/></svg>
  );
  const SettingsIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><circle cx="12" cy="12" r="3" fill="#b6d7b0" stroke="#4e3b1f" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="#4e3b1f" strokeWidth="1.5"/></svg>
  );
  const LogoutIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M16 17l5-5-5-5M21 12H9" stroke="#c97c3a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="4" width="8" height="16" rx="2" fill="#e6f2ef" stroke="#4e3b1f" strokeWidth="2"/></svg>
  );

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
      icon: HarvestIcon,
      label: 'Commissions',
      color: 'from-orange-600 to-yellow-400',
      bgColor: 'from-orange-700/20 to-yellow-400/20',
      hoverColor: 'from-orange-700 to-yellow-400',
    },
    // {
    //   to: '/dashboard/packages',
    //   icon: BarnIcon,
    //   label: 'Upgrade',
    //   color: 'from-yellow-600 to-amber-400',
    //   bgColor: 'from-yellow-700/20 to-amber-400/20',
    //   hoverColor: 'from-yellow-700 to-amber-400',
    // },
    {
      to: '/dashboard/withdrawals',
      icon: HarvestIcon,
      label: 'Withdraw',
      color: 'from-lime-600 to-green-400',
      bgColor: 'from-lime-700/20 to-green-400/20',
      hoverColor: 'from-lime-700 to-green-400',
    },
    {
      to: '/dashboard/profile',
      icon: SettingsIcon,
      label: 'Settings',
      color: 'from-gray-500 to-slate-400',
      bgColor: 'from-gray-600/20 to-slate-500/20',
      hoverColor: 'from-gray-600 to-slate-500',
    },
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

  // Custom button component
  const CustomButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    active = false, 
    index = -1,
    gradient = 'from-gray-500 to-slate-400',
    bgGradient = 'from-gray-600/20 to-slate-500/20',
    hoverGradient = 'from-gray-600 to-slate-500',
    className = ''
  }) => {
    const isHovered = index === hoverIndex
    const isActiveOrHovered = active || isHovered

    return (
      <button
        className={classNames(
          "relative group flex items-center rounded-xl transition-all duration-300 ease-out",
          isCollapsed && !isMobile ? "w-12 h-12 justify-center mx-auto" : "h-14 w-full px-4",
          active ? `bg-gradient-to-r ${gradient} text-white` : `bg-gradient-to-r ${bgGradient} text-white/80 hover:text-white`,
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setHoverIndex(index)}
        onMouseLeave={() => setHoverIndex(-1)}
      >
        {/* Glow effect */}
        <div 
          className={classNames(
            "absolute inset-0 rounded-xl opacity-0 blur-xl transition-opacity duration-300",
            isActiveOrHovered ? "opacity-70" : "",
            `bg-gradient-to-r ${gradient}`
          )}
        />
        
        {/* Button content */}
        <div className="flex items-center relative z-10 w-full">
          <div 
            className={classNames(
              "flex-shrink-0 flex items-center justify-center rounded-lg h-8 w-8 transition-all duration-300",
              active ? "text-white" : "text-white/70"
            )}
          >
            <Icon className={classNames(
              "transition-all duration-300 ease-out",
              isActiveOrHovered ? "h-6 w-6 scale-110" : "h-5 w-5"
            )} />
          </div>
          
          {(!isCollapsed || isMobile) && (
            <span className={classNames(
              "ml-3 whitespace-nowrap transition-all duration-300",
              active ? "font-semibold" : "font-medium"
            )}>
              {label}
            </span>
          )}
          
          {/* Dynamic indicator for active state */}
          {active && !isCollapsed && !isMobile && (
            <div className="ml-auto">
              <Star size={14} className="fill-white" />
            </div>
          )}
        </div>
        
        {/* Hover effect - pulse outlines */}
        {isHovered && (
          <>
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-pulse" />
            <div className="absolute -inset-1 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        )}
      </button>
    )
  }

  // Level indicator component
  const LevelIndicator = ({ level = 1, className = "" }) => {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex space-x-1">
          {Array(3).fill(0).map((_, i) => (
            <div 
              key={i} 
              className={classNames(
                "h-1.5 rounded-full transition-all duration-300",
                i < level ? "w-4 bg-gradient-to-r from-green-400 to-emerald-500" : "w-3 bg-gray-600"
              )}
            />
          ))}
        </div>
        <span className="ml-2 text-xs text-gray-400">Level {level}</span>
      </div>
    )
  }

  // User profile display component
  const UserProfileCard = ({ isExpanded, setIsExpanded, isMobileView = false }) => {
    return (
      <div 
        className={classNames(
          "relative overflow-hidden transition-all duration-500 ease-out",
          isCollapsed && !isMobileView ? "h-20" : isExpanded ? "h-40 " : "h-20"
        )}
      >
        <div 
          className={classNames(
            "absolute inset-0 bg-gradient-to-br from-indigo-900/70 to-purple-900/70",
            "backdrop-blur-sm border-b border-white/10"
          )}
        />
        
        {/* Animated particles background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array(20).fill(0).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 10 + 10}s linear infinite`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 p-4">
          <div className={classNames(
            "flex items-center",
            isCollapsed && !isMobileView ? "justify-center" : "justify-between"
          )}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-lg text-white font-bold ring-2 ring-white/20 overflow-hidden">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-50">
                    {Array(5).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="absolute rounded-full bg-white/30"
                        style={{
                          width: `${Math.random() * 20 + 10}px`,
                          height: `${Math.random() * 20 + 10}px`,
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `pulse ${Math.random() * 4 + 2}s ease-in-out infinite alternate`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-indigo-900 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                </div>
              </div>
              
              {(!isCollapsed || isMobileView) && (
                <div>
                  <p className="text-sm font-semibold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-indigo-300/70">@{user?.username}</p>
                </div>
              )}
            </div>
            
            {(!isCollapsed || isMobileView) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
              >
                <ChevronUp
                  size={14}
                  className={classNames(
                    "transition-transform duration-300",
                    isExpanded ? "rotate-180" : ""
                  )}
                />
              </button>
            )}
          </div>
          
          {(!isCollapsed || isMobileView) && (
            <div className={classNames(
              "mt-3 transition-all duration-500 ease-out",
              isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
              <div className="flex items-center justify-between mb-3">
                <LevelIndicator level={2} />
                <span className="text-xs text-green-400 font-medium px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/20">
                  Active
                </span>
              </div>
              
           
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Sidebar content component 
  const NavigationContent = ({ isMobileView = false }) => (
    <div 
      className={classNames(
        "flex flex-col h-full",
        navAnimation ? "animate-pulse" : ""
      )}
    >
      {(!isCollapsed || isMobileView) && (
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Star size={16} className="text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-indigo-200 to-purple-300 bg-clip-text text-transparent">
              {siteName}
            </span>
          </Link>
        </div>
      )}
      
      <UserProfileCard 
        isExpanded={expandedProfile} 
        setIsExpanded={setExpandedProfile} 
        isMobileView={isMobileView} 
      />
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-3">
        {menuItems.map((item, index) => (
          <CustomButton
            key={item.to}
            icon={item.icon}
            label={item.label}
            onClick={() => handleNavClick(item.to)}
            active={location.pathname === item.to}
            index={index}
            gradient={item.color}
            bgGradient={item.bgColor}
            hoverGradient={item.hoverColor}
          />
        ))}
      </div>
      
      <div className="p-3 border-t border-white/10">
        <CustomButton
          icon={LogOut}
          label="Logout"
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-900/30 to-orange-900/30 hover:from-red-600/20 hover:to-orange-600/20"
          gradient="from-red-500 to-orange-400"
        />
      </div>
      
      {!isMobileView && (
        <div 
          className="absolute top-1/2 -right-3 transform -translate-y-1/2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <button className="h-24 w-6 rounded-r-lg bg-gradient-to-b from-indigo-700 to-purple-800 text-white flex flex-col items-center justify-center cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-colors duration-300 border-r border-t border-b border-white/20">
            <div className="rotate-90 text-xs font-semibold tracking-widest opacity-80">
              {isCollapsed ? 'OPEN' : 'FOLD'}
            </div>
          </button>
        </div>
      )}
    </div>
  )

  // Mobile navigation trigger component
  const MobileNavTrigger = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-700/30 border border-white/20"
    >
      {isMobileOpen ? (
        <X size={24} className="animate-in" />
      ) : (
        <Menu size={24} className="animate-in" />
      )}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-700 blur-xl opacity-60 -z-10"></div>
    </button>
  )

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
        {/* <div className="absolute left-1/2 -top-8 -translate-x-1/2 z-10 flex flex-col items-center">
          <button
            onClick={() => handleNavClick('/dashboard/packages')}
            className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] shadow-lg rounded-full w-16 h-16 flex items-center justify-center border-4 border-white hover:scale-110 transition-transform"
            style={{ boxShadow: '0 4px 24px 0 #ffe06655' }}
          >
            <img src="https://static.vecteezy.com/system/resources/previews/042/125/124/non_2x/cacao-beans-with-leaves-isolated-on-transparent-background-with-clipping-path-3d-render-free-png.png" alt="Plant Cocoa" className="w-10 h-10" />
          </button>
        </div> */}
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
          <div className="flex items-center gap-3 md:gap-6">
            {/* <img src="/assets/cocoa-default.jpg" alt="Cocoa Pod" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#fffbe6] shadow" /> */}
            <div className="flex flex-col">
              <span className="font-cursive text-lg md:text-2xl text-[#4e3b1f] leading-tight" style={{fontFamily:'Pacifico, cursive'}}>Welcome, {user?.firstName}</span>
              {/* <span className="text-xs md:text-sm text-[#2c5f63]/80 font-medium">{siteName} Cocoa Dashboard</span> */}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <UserNotificationBell />
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-100/60 rounded-xl px-3 md:px-4 text-xs md:text-base">
              <LogOut className="h-5 w-5 mr-1" /> Logout
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