import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Icon } from '@iconify/react'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../components/ui/collapsible'

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState({})
  const [selectedGroup, setSelectedGroup] = useState(null)

  useEffect(() => {
    // Check if user is not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user is not an admin
    if (user.role !== 'ADMIN') {
      // Redirect non-admin users
      if (user.node?.package) {
        navigate('/dashboard');
      } else {
        navigate('/activation');
      }
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'ADMIN') {
    return null; // Or a loading spinner
  }

  // Use location.pathname directly instead of state
  const activePath = location.pathname

  const handleNavigation = useCallback((to) => {
    if (to !== location.pathname) {
      navigate(to)
    }
  }, [navigate, location.pathname])

  const toggleGroup = useCallback((label, hasChildren) => {
    if (hasChildren) {
      setSelectedGroup(prev => prev === label ? null : label)
      setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
    }
  }, [])

  const isActiveLink = useCallback((itemTo) => {
    // Exact match or child route match
    return activePath === itemTo || 
           (itemTo !== '/admin' && activePath.startsWith(itemTo))
  }, [activePath])

  // Memoize the entire menu items array
  const menuItems = useMemo(() => [
    { 
      label: 'Dashboard',
      icon: 'lucide:layout-dashboard',
      to: '/admin'
    },
    {
      label: 'User Management',
      icon: 'ph:users-three-bold',
      children: [
        { 
          label: 'All Users', 
          to: '/admin/users',
          icon: 'ph:users-bold'
        },
        { 
          label: 'Roles', 
          to: '/admin/users/roles',
          icon: 'ph:shield-check-bold'
        },
        { 
          label: 'Permissions', 
          to: '/admin/users/permissions',
          icon: 'ph:key-bold'
        }
      ]
    },
    {
      label: 'Products',
      icon: 'ph:package-bold',
      children: [
        { 
          label: 'All Packages', 
          to: '/admin/packages',
          icon: 'ph:cube-bold'
        },
        { 
          label: 'Categories', 
          to: '/admin/packages/categories',
          icon: 'ph:folders-bold'
        },
        { 
          label: 'Pricing', 
          to: '/admin/packages/pricing',
          icon: 'ph:tag-bold'
        }
      ]
    },
    {
      label: 'Finance',
      icon: 'ph:currency-circle-dollar-bold',
      children: [
        { 
          label: 'Withdrawals', 
          to: '/admin/finance/withdrawals',
          icon: 'ph:money-bold'
        },
        { 
          label: 'Commissions', 
          to: '/admin/finance/commissions',
          icon: 'ph:percent-bold'
        },
        { 
          label: 'Transactions', 
          to: '/admin/finance/transactions',
          icon: 'ph:arrows-left-right-bold'
        }
      ]
    },
    {
      label: 'Support',
      icon: 'ph:handshake-bold',
      children: [
        { 
          label: 'Tickets', 
          to: '/admin/support/tickets',
          icon: 'ph:ticket-bold'
        },
        { 
          label: 'FAQ', 
          to: '/admin/support/faq',
          icon: 'ph:question-bold'
        },
        { 
          label: 'Knowledge Base', 
          to: '/admin/support/kb',
          icon: 'ph:book-open-bold'
        }
      ]
    },
    {
      label: 'Messages',
      icon: 'ph:chat-circle-text-bold',
      to: '/admin/messages'
    },
    {
      label: 'Settings',
      icon: Settings,
      to: '/admin/settings'
    }
  ], [])

  // Memoize NavItem component
  const NavItem = useCallback(({ item, isChild }) => {
    const isActive = item.to ? isActiveLink(item.to) : false
    const isChildActive = item.children?.some(child => isActiveLink(child.to))
    const isOpen = openGroups[item.label]
    const isSelected = selectedGroup === item.label

    if (item.children) {
      return (
        <Collapsible
          open={isOpen}
          onOpenChange={() => toggleGroup(item.label, true)}
        >
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <CollapsibleTrigger
                  onClick={(e) => {
                    e.preventDefault()
                    toggleGroup(item.label, true)
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2",
                    "transition-colors duration-200 ease-in-out",
                    (isChildActive)
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "justify-center w-full"
                  )}>
                    <Icon icon={item.icon} className={cn(
                      "shrink-0",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4"
                    )} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <Icon
                      icon={isOpen ? "lucide:chevron-down" : "lucide:chevron-right"}
                      className="h-4 w-4 shrink-0"
                    />
                  )}
                </CollapsibleTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={10}>
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <CollapsibleContent className="pl-4">
            {item.children.map((child) => (
              <NavItem key={child.to} item={child} isChild />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.to}
              onClick={(e) => {
                e.preventDefault()
                handleNavigation(item.to)
              }}
              className={cn(
                "flex items-center rounded-lg px-3 py-2",
                "transition-colors duration-200 ease-in-out",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/10 hover:text-white",
                isCollapsed && "justify-center",
                isChild && "mt-1"
              )}
            >
              <Icon icon={item.icon} className={cn(
                "shrink-0",
                isCollapsed ? "h-5 w-5" : "h-4 w-4"
              )} />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={10}>
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }, [activePath, handleNavigation, isCollapsed, openGroups, toggleGroup, isActiveLink])

  useEffect(() => {
    // Reset selected group when navigating to a new path
    if (!location.pathname.includes(selectedGroup?.toLowerCase() || '')) {
      setSelectedGroup(null)
    }
  }, [location.pathname, selectedGroup])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-purple-500 text-white"
        >
          <Icon icon="lucide:menu" className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800",
          isCollapsed ? "w-16" : "w-64",
          isMobile && "hidden"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex h-14 items-center border-b border-white/10 px-6",
          isCollapsed && "justify-center px-0"
        )}>
          {!isCollapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-white">Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavItem key={item.to || item.label} item={item} />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>

        {/* Collapse Toggle Button */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 p-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-purple-500 text-white border border-white/20 shadow-lg hover:from-yellow-600 hover:to-purple-600 transition-all"
          >
            <Icon
              icon={isCollapsed ? "lucide:chevron-right" : "lucide:chevron-left"}
              className="h-3 w-3"
            />
          </button>
        )}
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent
            side="left"
            className="w-64 p-0 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800"
          >
            <SheetHeader className="h-14 border-b border-white/10 px-6">
              <SheetTitle className="text-white">Admin Panel</SheetTitle>
            </SheetHeader>
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <NavItem key={item.to || item.label} item={item} />
              ))}
            </nav>
            <div className="mt-auto p-4 border-t">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300",
        !isMobile && (isCollapsed ? "pl-16" : "pl-64"),
        isMobile && "pl-0"
      )}>
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
