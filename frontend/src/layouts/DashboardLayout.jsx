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
    setNavAnimation(true)
    setTimeout(async () => {
      try {
        await logout()   
      } catch (error) {
        toast.error(error.message)
      }
      setNavAnimation(false)
    }, 800)
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

  // Navigation menu items
  const menuItems = [
    { 
      to: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Home',
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'from-blue-600/20 to-cyan-500/20',
      hoverColor: 'from-blue-600 to-cyan-500'
    },
    { 
      to: '/dashboard/network', 
      icon: Network, 
      label: 'Network',
      color: 'from-purple-500 to-indigo-400',
      bgColor: 'from-purple-600/20 to-indigo-500/20',
      hoverColor: 'from-purple-600 to-indigo-500'
    },
    { 
      to: '/dashboard/commissions', 
      icon: DollarSign, 
      label: 'Commissions',
      color: 'from-green-500 to-emerald-400',
      bgColor: 'from-green-600/20 to-emerald-500/20',
      hoverColor: 'from-green-600 to-emerald-500'
    },
    { 
      to: '/dashboard/packages', 
      icon: Package, 
      label: 'Packages',
      color: 'from-amber-500 to-yellow-400',
      bgColor: 'from-amber-600/20 to-yellow-500/20',
      hoverColor: 'from-amber-600 to-yellow-500'
    },
    { 
      to: '/dashboard/withdrawals', 
      icon: Wallet, 
      label: 'Withdrawals',
      color: 'from-red-500 to-rose-400',
      bgColor: 'from-red-600/20 to-rose-500/20',
      hoverColor: 'from-red-600 to-rose-500'
    },
    { 
      to: '/dashboard/profile', 
      icon: Settings, 
      label: 'Settings',
      color: 'from-gray-500 to-slate-400',
      bgColor: 'from-gray-600/20 to-slate-500/20',
      hoverColor: 'from-gray-600 to-slate-500'
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

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Desktop Navigation */}
      {!isMobile && (
        <aside 
          ref={navRef}
          className={classNames(
            "fixed inset-y-0 left-0 z-30 bg-gray-950/70 backdrop-blur-xl",
            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "border-r border-white/10",
            isCollapsed ? "w-20" : "w-72"
          )}
        >
          <NavigationContent />
        </aside>
      )}

      {/* Mobile Navigation - Slide up panel */}
      {isMobile && (
        <>
          <MobileNavTrigger />
          
          <div 
            className={classNames(
              "fixed inset-0 bg-black/60 z-40 transition-opacity duration-500",
              isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsMobileOpen(false)}
          />
          
          <aside 
            className={classNames(
              "fixed bottom-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl",
              "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-t border-white/10 rounded-t-2xl",
              "flex flex-col",
              isMobileOpen ? "h-[85vh]" : "h-0"
            )}
          >
            {isMobileOpen && <NavigationContent isMobileView />}
          </aside>
        </>
      )}

      {/* Main Content */}
      <main 
        className={classNames(
          "min-h-screen transition-all duration-500",
          !isMobile && (isCollapsed ? "pl-20" : "pl-72")
        )}
      >
        <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 min-h-screen">
          {/* Top Bar */}
          <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
           
            
            <div className="flex items-center space-x-4">
              <button className="relative h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border border-gray-900 text-xs flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </header>
          
          {/* Main Content Area */}
          <div className="p-6">
            <Outlet />
          </div>
          
          <DashboardFooter />
        </div>
      </main>
      
      {/* Background animated elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient circles */}
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl"></div>
        <div className="absolute top-1/4 -left-20 h-60 w-60 rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"
        ></div>
      </div>
      
      {/* Global CSS */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-10px) translateX(5px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.8;
          }
        }
        
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  )
}