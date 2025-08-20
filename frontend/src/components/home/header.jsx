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
            "rounded-full border shadow-lg backdrop-blur",
            "bg-white border-emerald-100",
            "transition-all duration-300"
          )}>
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img
                src={siteLogoUrl}
                alt={siteName}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-emerald-200 shadow"
              />
              <span className="hidden sm:inline-block font-extrabold text-xl sm:text-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
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
                          <NavigationMenuTrigger className="px-4 py-2 rounded-full text-sm font-semibold text-emerald-800 hover:text-cyan-800 bg-emerald-50 hover:bg-cyan-50 border border-emerald-100">
                            {item.name}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="w-56 p-2 bg-white rounded-2xl border border-emerald-100 shadow-xl">
                              {item.submenu.map((subItem) => (
                                <li key={subItem.name}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      to={subItem.href}
                                      className="block px-3 py-2 rounded-lg text-sm text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50"
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
                            className="px-4 py-2 rounded-full text-sm font-semibold text-emerald-800 hover:text-cyan-800 hover:bg-emerald-50"
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
                      className="h-9 w-9 rounded-full border border-emerald-200 object-cover shadow-sm"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                  <span className="hidden lg:inline-block text-sm font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
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
                    className="text-emerald-700 hover:text-cyan-700 hover:bg-emerald-50 rounded-full px-4 font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 font-bold rounded-full px-5 shadow"
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
                className="text-emerald-800 hover:text-cyan-800 hover:bg-emerald-50 rounded-full"
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
          <div className="mt-2 rounded-3xl border border-emerald-100 bg-white/90 backdrop-blur shadow-2xl overflow-hidden">
            <div className="p-3 divide-y divide-emerald-50">
              <div className="py-2">
                {navigation.map((item) => (
                  <div key={item.name} className="">
                    {item.submenu ? (
                      <NavigationMenu>
                        <NavigationMenuList>
                          <NavigationMenuItem className="w-full">
                            <NavigationMenuTrigger className="w-full justify-between px-4 py-2 rounded-xl text-emerald-800 hover:text-cyan-800 bg-emerald-50 hover:bg-cyan-50 border border-emerald-100">
                              {item.name}
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="p-2">
                              <ul className="w-full bg-white rounded-2xl">
                                {item.submenu.map((subItem) => (
                                  <li key={subItem.name}>
                                    <NavigationMenuLink asChild>
                                      <Link
                                        to={subItem.href}
                                        className="block w-full px-4 py-2 text-sm text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50 rounded-lg"
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
                        className="block w-full px-4 py-2 text-sm font-semibold text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50 rounded-xl"
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
                    <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white border border-emerald-100 shadow-sm">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User avatar'}
                          className="h-10 w-10 rounded-full border border-emerald-200 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">
                          {initials}
                        </div>
                      )}
                      <div className="text-emerald-900 font-semibold">
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
                      className="w-full justify-center text-emerald-800 hover:text-cyan-800 hover:bg-emerald-50 rounded-full font-semibold"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 font-bold rounded-full"
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
