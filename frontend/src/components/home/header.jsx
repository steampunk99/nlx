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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ",
      isScrolled ? "transparent " : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={siteLogoUrl} alt={siteName} className="h-12 w-12 rounded-full shadow-lg border-2 border-emerald-200 group-hover:scale-110 transition-transform duration-200" />
            <span className="font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-200">
              {siteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.submenu ? (
                      <>
                        <NavigationMenuTrigger className={cn(
                          "px-5 py-2 text-base font-semibold rounded-xl transition-colors duration-200",
                          "bg-gradient-to-r from-emerald-100/60 to-cyan-100/60 hover:from-emerald-200 hover:to-cyan-200 text-emerald-900 hover:text-cyan-900",
                          "border border-emerald-200 hover:border-cyan-200 shadow-sm"
                        )}>
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="w-56 p-2 bg-white/95 rounded-2xl border border-emerald-100 shadow-2xl">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={subItem.href}
                                    className="block px-4 py-2 text-base text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50 rounded-lg transition-colors"
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
                          className="px-5 py-2 text-base font-semibold text-emerald-800 hover:text-cyan-700 rounded-xl hover:bg-emerald-50 transition-colors"
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

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-base font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl shadow-sm">
                  {user.firstName} {user.lastName}
                </span>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-100/60 rounded-xl px-4"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="text-emerald-700 hover:text-cyan-700 hover:bg-emerald-50 rounded-xl px-5 font-semibold"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 font-bold rounded-xl px-6 shadow-lg"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden bg-green-600 p-4 transition  rounded-full shadow-lg">
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="icon"
              className="text-white hover:text-emerald-100 hover:bg-emerald-600/60 rounded-full"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-200 backdrop-blur-lg  shadow-2xl rounded-b-3xl">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {navigation.map((item) => (
              <div key={item.name} className="space-y-2">
                {item.submenu ? (
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem className="w-full">
                        <NavigationMenuTrigger className="w-full text-left text-emerald-800 hover:text-cyan-700 bg-emerald-50 hover:bg-cyan-50 rounded-xl border border-emerald-100">
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="p-8">
                          <ul className="w-full  bg-white rounded-2xl ">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.name}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={subItem.href}
                                    className="block w-full px-4 text-start py-2 text-base text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50 rounded-lg"
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
                    className="block px-4 py-2 text-base font-semibold text-emerald-800 hover:text-cyan-700 hover:bg-emerald-50 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}

            {/* Mobile auth buttons */}
            <div className="pt-4  space-y-3">
              {user ? (
                <div className="space-y-3">
                  
                  <Button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-start text-red-700 hover:text-red-600 hover:bg-red-100/60 rounded-xl"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    variant="ghost"
                    className="w-full justify-center text-emerald-700 hover:text-cyan-700 hover:bg-emerald-50 rounded-xl font-semibold"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 font-bold rounded-xl shadow-lg"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
