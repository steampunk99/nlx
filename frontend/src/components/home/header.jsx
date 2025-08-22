import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import defaultLogo from "../../assets/logo.png"
import { useAuth } from '../../hooks/auth/useAuth'
import { useSiteConfig } from '../../hooks/config/useSiteConfig'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"

const navigation = [
  { 
    name: "Explore",
    href: "/privacy",
    submenu: [
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Contact Us", href: "/contact" },
    ]
  },
]

//this is the header component
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { siteName, siteLogoUrl } = useSiteConfig()
  const navigate = useNavigate()

  // Resolve avatar URL ONLY if provided by backend during registration.
  // No regeneration on the frontend.
  const avatarUrl = (() => {
    const explicit = user?.avatarUrl || user?.avatar
    return explicit && /^(https?:\/\/|data:image\/.+;base64,|\/)/i.test(explicit) ? explicit : null
  })()

  // Fallback initials badge when no avatar URL is present
  const initials = (
    ((user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')).toUpperCase() ||
    (user?.email ? user.email[0].toUpperCase() : '') ||
    '?'
  )

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "translate-y-0" : "translate-y-0"
    )}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mt-3">
          <div className={cn(
            "flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3",
            "rounded-full border backdrop-blur",
            "bg-white/90 border-stone-200",
            "transition-all duration-300",
            isScrolled ? "shadow-lg" : "shadow-md"
          )}>
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img
                src={siteLogoUrl}
                alt={siteName}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-stone-300 shadow"
              />
              <span className="hidden sm:inline-block font-mono font-semibold text-xl sm:text-2xl text-stone-900 tracking-tight">
                {siteName}
              </span>
            </Link>

            {/* Center: Navigation */}
            <nav className="flex-1 hidden md:flex justify-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      {item.submenu ? (
                        <>
                          <NavigationMenuTrigger className="px-3 py-1.5 rounded-full text-sm font-medium text-stone-800 hover:text-amber-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30">
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="w-56 p-2 bg-white rounded-2xl border border-stone-200 shadow-xl">
                              {item.submenu.map((subItem) => (
                                <li key={subItem.name}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={subItem.href}
                                      className="block px-3 py-2 rounded-lg text-sm text-stone-800 hover:text-amber-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                                    >
                                      {subItem.name}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className="px-3 py-1.5 rounded-full text-sm font-medium text-stone-800 hover:text-amber-700 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                          >
                            {item.name}
                          </Link>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Right: Auth/Avatar */}
            <div className="ml-auto hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User avatar'}
                      className="h-9 w-9 rounded-full border border-stone-300 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                  <span className="hidden lg:inline-block text-sm font-medium text-stone-800 bg-stone-100 px-3 py-1 rounded-full">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    className="text-stone-800 hover:text-amber-700 hover:bg-stone-100 rounded-full px-4 font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-amber-600 text-white hover:bg-amber-700 font-semibold rounded-full px-5 shadow"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-auto">
              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="text-stone-800 hover:text-amber-700 hover:bg-stone-100 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
              >
                <span className="sr-only">Toggle menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 sm:px-6">
          <div className="mt-2 rounded-3xl border border-stone-200 bg-white/95 backdrop-blur shadow-2xl overflow-hidden">
            <div className="p-3 divide-y divide-stone-100">
              <div className="py-2">
                {navigation.map((item) => (
                  <div key={item.name} className="">
                    {item.submenu ? (
                      <NavigationMenu>
                        <NavigationMenuList>
                          <NavigationMenuItem className="w-full">
                            <NavigationMenuTrigger className="w-full justify-between px-4 py-2 rounded-xl text-stone-800 hover:text-amber-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30">
                              {item.name}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="p-2">
                              <ul className="w-full bg-white rounded-2xl">
                                {item.submenu.map((subItem) => (
                                  <li key={subItem.name}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={subItem.href}
                                        className="block w-full px-4 py-2 text-sm text-stone-800 hover:text-amber-700 hover:bg-stone-100 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                                        onClick={() => setMobileMenuOpen(false)}
                                      >
                                        {subItem.name}
                                      </Link>
                                    </NavigationMenuLink>
                                  </li>
                                ))}
                              </ul>
                            </NavigationMenuContent>
                          </NavigationMenuItem>
                        </NavigationMenuList>
                      </NavigationMenu>
                    ) : (
                      <Link
                        to={item.href}
                        className="block w-full px-4 py-2 text-sm font-medium text-stone-800 hover:text-amber-700 hover:bg-stone-100 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              <div className="py-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white border border-stone-200 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User avatar'}
                          className="h-10 w-10 rounded-full border border-stone-300 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="text-stone-900 font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-center text-stone-800 hover:text-amber-700 hover:bg-stone-100 rounded-full font-medium"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-center bg-amber-600 text-white hover:bg-amber-700 font-semibold rounded-full"
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
