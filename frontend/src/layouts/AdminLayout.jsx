import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Icon } from '@iconify/react'
import { useState, useEffect, useCallback, useMemo } from 'react'
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState({})
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Use location.pathname directly instead of state
  const activePath = location.pathname

  const handleNavigation = useCallback((to) => {
    if (to !== location.pathname) {
      setSelectedGroup(null)
      navigate(to)
    }
  }, [navigate, location.pathname])

  const toggleGroup = useCallback((label, hasChildren) => {
    if (hasChildren) {
      setSelectedGroup(prev => prev === label ? null : label)
      setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
    }
  }, [])

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

  // Memoize NavItem component to prevent unnecessary re-renders
  const NavItem = useCallback(({ item, isChild }) => {
    const isActive = activePath === item.to
    const isChildActive = item.children?.some(child => child.to === activePath)
    const isOpen = openGroups[item.label]
    const isSelected = selectedGroup === item.label

    const handleClick = (e, to, isCollapsible = false) => {
      e.preventDefault()
      if (isCollapsible) {
        toggleGroup(item.label, true)
      } else {
        handleNavigation(to)
      }
    }

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
                  onClick={(e) => handleClick(e, null, true)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2",
                    "transition-colors duration-200 ease-in-out",
                    (isSelected || isChildActive)
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "h-full w-full justify-center"
                  )}>
                    <Icon icon={item.icon} className={cn(
                      "h-4 w-4 transition-colors duration-200",
                      (isSelected || isChildActive) ? "text-blue-600" : "text-gray-500"
                    )} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium tracking-tight">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <Icon icon="ph:caret-right-bold" className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isOpen && "rotate-90"
                    )} />
                  )}
                </CollapsibleTrigger>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  {item.label}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          {!isCollapsed && (
            <CollapsibleContent className="space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.to}
                  to={child.to}
                  onClick={(e) => handleClick(e, child.to)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 pl-9",
                    "transition-colors duration-200 ease-in-out",
                    activePath === child.to
                      ? "bg-blue-50/80 text-blue-800"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon icon={child.icon} className={cn(
                    "h-3.5 w-3.5",
                    activePath === child.to ? "text-blue-500" : "text-gray-400"
                  )} />
                  <span className={cn(
                    "text-sm tracking-tight",
                    activePath === child.to ? "font-medium" : "font-normal"
                  )}>{child.label}</span>
                </Link>
              ))}
            </CollapsibleContent>
          )}
        </Collapsible>
      )
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.to}
              onClick={(e) => handleClick(e, item.to)}
              className={cn(
                "flex items-center gap-2 rounded-lg",
                "transition-colors duration-200 ease-in-out",
                isCollapsed && !isChild ? "h-10 w-10 justify-center p-0" : "px-3 py-2",
                isActive
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                isChild && !isCollapsed && "ml-4 pl-6"
              )}
            >
              {(!isChild || isCollapsed) && (
                <Icon icon={item.icon} className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
              )}
              {(!isCollapsed || (isChild && !isCollapsed)) && (
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              )}
            </Link>
          </TooltipTrigger>
          {isCollapsed && !isChild && (
            <TooltipContent side="right">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }, [activePath, isCollapsed, openGroups, handleNavigation, toggleGroup, selectedGroup])

  const menuItems = [
    { 
      label: 'Overview',
      icon: 'ph:squares-four-bold',
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
          to: '/admin/withdrawals',
          icon: 'ph:money-bold'
        },
        { 
          label: 'Commissions', 
          to: '/admin/commissions',
          icon: 'ph:percent-bold'
        },
        { 
          label: 'Transactions', 
          to: '/admin/transactions',
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
      icon: 'ph:gear-six-bold',
      to: '/admin/settings'
    }
  ]

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate('/login')
  }

  const Sidebar = () => (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-64",
        isMobile && "hidden"
      )}
    >
      {/* Header with Logo */}
      <div className={cn(
        "flex h-14 items-center justify-between border-b",
        isCollapsed ? "px-2" : "px-4"
      )}>
        <Link to="/" className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "space-x-2"
        )}>
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500">
            <Icon icon="ph:currency-circle-dollar-bold" className="h-4 w-4 text-blue-50" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-lg font-bold tracking-tight">
              Zillionaire
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg",
            "transition-colors duration-200 ease-in-out",
            "hover:bg-gray-100"
          )}
        >
          <Icon icon="ph:x-bold" className={cn(
            "h-5 w-5 text-gray-500 transition-transform duration-200",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Profile Section */}
      <div className={cn(
        "flex items-center gap-2 border-b p-4",
        isCollapsed && "justify-center"
      )}>
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">Admin User</span>
            <span className="text-xs text-gray-500">admin@zillionaire.com</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </TooltipProvider>
      </nav>

      {/* Footer Actions */}
      <div className="border-t p-3 space-y-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                  "transition-colors duration-200 ease-in-out",
                  isCollapsed ? "justify-center" : "justify-start",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => navigate('/admin/settings')}
              >
                <Icon icon="ph:gear-six-bold" className="h-5 w-5 text-gray-500" />
                {!isCollapsed && <span className="ml-2">Settings</span>}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                  "transition-colors duration-200 ease-in-out",
                  isCollapsed ? "justify-center" : "justify-start",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={() => navigate('/admin/support')}
              >
                <Icon icon="ph:life-support-bold" className="h-5 w-5 text-gray-500" />
                {!isCollapsed && <span className="ml-2">Support</span>}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Support</TooltipContent>
            )}
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                  "transition-colors duration-200 ease-in-out",
                  isCollapsed ? "justify-center" : "justify-start",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
                onClick={handleLogout}
              >
                <Icon icon="ph:sign-out-bold" className="h-5 w-5 text-gray-500" />
                {!isCollapsed && <span className="ml-2">Logout</span>}
              </div>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <Icon icon="ph:currency-circle-dollar-bold" className="h-5 w-5 text-blue-500" />
              <span className="font-display text-lg font-bold tracking-tight">Zillionaire</span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-2 border-b p-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Admin User</span>
              <span className="text-xs text-gray-500">admin@zillionaire.com</span>
            </div>
          </div>
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
          <div className="border-t p-4 space-y-1">
            <div
              className={cn(
                "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                "transition-colors duration-200 ease-in-out",
                "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={() => navigate('/admin/settings')}
            >
              <Icon icon="ph:gear-six-bold" className="h-5 w-5 text-gray-500" />
              <span className="ml-2">Settings</span>
            </div>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                "transition-colors duration-200 ease-in-out",
                "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={() => navigate('/admin/support')}
            >
              <Icon icon="ph:life-support-bold" className="h-5 w-5 text-gray-500" />
              <span className="ml-2">Support</span>
            </div>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center rounded-lg px-3 py-2",
                "transition-colors duration-200 ease-in-out",
                "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={handleLogout}
            >
              <Icon icon="ph:sign-out-bold" className="h-5 w-5 text-gray-500" />
              <span className="ml-2">Logout</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        isMobile ? "ml-0" : (isCollapsed ? "ml-10" : "ml-64"),
        "bg-gray-50"
      )}>
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-gray-50 px-4">
            <div
              className={cn(
                "h-8 w-8 cursor-pointer rounded-lg p-2",
                "transition-all duration-200 ease-in-out",
                "hover:bg-gray-100"
              )}
              onClick={() => setIsMobileOpen(true)}
            >
              <Icon icon="ph:menu-bold" className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="ph:currency-circle-dollar-bold" className="h-5 w-5 text-blue-500" />
              <span className="font-bold">Zillionaire</span>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        )}
        
        {/* Content */}
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
