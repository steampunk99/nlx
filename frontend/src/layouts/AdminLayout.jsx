import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils'
import { Icon } from '@iconify/react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Overview', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Packages', href: '/admin/packages' },
  { name: 'Withdrawals', href: '/admin/finance/withdrawals' },
  { name: 'Commissions', href: '/admin/finance/commissions' },
  { name: 'Transactions', href: '/admin/finance/transactions' },
  { name: 'Settings', href: '/admin/settings' }
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Navigation */}
      <div className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm backdrop-saturate-150 supports-[backdrop-filter]:bg-white/50">
        {/* Gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-cyan-500/50" />
        
        <nav className="container mx-auto">
          <div className="flex items-center justify-between">
            {isMobile ? (
              <div className="flex items-center justify-between py-4 px-4 w-full">
                <Link to="/admin" className="text-lg font-semibold">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.firstName} />
                          <AvatarFallback>{getInitials(`${user?.firstName} ${user?.lastName}`)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{user?.firstName} {user?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Icon icon="lucide:menu" className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-1 mt-6">
                        {navigation.map((item) => {
                          const isActive = location.pathname === item.href ||
                            (item.href !== '/admin' && location.pathname.startsWith(item.href))
                          
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                "hover:bg-gray-100",
                                isActive && "bg-blue-50 text-blue-600"
                              )}
                            >
                              {item.name}
                            </Link>
                          )
                        })}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <ul className="flex -mb-[1px] min-w-max">
                    {navigation.map((item) => {
                      const isActive = location.pathname === item.href ||
                        (item.href !== '/admin' && location.pathname.startsWith(item.href))
                      
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            className={cn(
                              "relative inline-flex items-center px-6 py-5 text-sm font-medium transition-colors",
                              "hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
                              isActive
                                ? "text-blue-600 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[4px] before:bg-gradient-to-r before:from-purple-500 before:via-blue-500 before:to-cyan-500"
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            {item.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <div className="flex items-center gap-2 pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatar} alt={user?.firstName} />
                          <AvatarFallback>{getInitials(`${user?.firstName} ${user?.lastName}`)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{user?.firstName} {user?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <Icon icon="lucide:log-out" className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-full min-h-screen bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
