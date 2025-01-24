import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { HoverLink } from "../ui/hover-link"
import { Menu, X, ChevronDown, LogOut } from "lucide-react"
import { cn } from "../../lib/utils"
import defaultLogo from "../../assets/logo.png"
import { useAuth } from '../../hooks/auth/useAuth';
import { usePackages } from '../../hooks/payments/usePackages';
import { Avatar } from '../ui/avatar';
import toast from "react-hot-toast"
import { useSiteConfig } from '../../hooks/config/useSiteConfig'

const navigation = [
  { 
    name: "Explore",
    href: "/privacy",
    submenu: [
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
    ]
  },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const { user, logout } = useAuth();
  const { siteName, siteLogoUrl } = useSiteConfig();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-16">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "mx-auto max-w-6xl rounded-md transition-all duration-500",
          isScrolled
            ? "bg-gray-900/90 backdrop-blur-md shadow-lg"
            : "bg-gray-900/75"
        )}
      >
        <nav 
          className={cn(
            "mx-auto flex items-center justify-between transition-all duration-300",
            isScrolled ? "h-12 px-4" : "h-14 px-6"
          )}
          aria-label="Global"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex lg:flex-1"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <img 
                src={defaultLogo} 
                alt={siteName}
                className="h-12 w-12" 
              />
            </motion.div>
            <Link
              to="/login"
              className="flex items-center gap-2 transition duration-300 hover:opacity-80"
            >
              <span className="sr-only"></span>
              <h1 className={cn(
                "font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300",
                isScrolled ? "text-lg" : "text-xl"
              )}>
                {siteName}
              </h1>
            </Link>
          </motion.div>
          
          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </motion.button>
          </div>

          {/* Desktop navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="hidden lg:flex lg:gap-x-12"
          >
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveSubmenu(item.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <HoverLink
                  to={item.href}
                  defaultText={item.name}
                  className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-100 transition duration-300 hover:text-emerald-400"
                />
                
                {item.submenu && activeSubmenu === item.name && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      
                      className="absolute left-0 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-gray-900/90 backdrop-blur-sm shadow-lg ring-1 ring-gray-900/5"
                    >
                      <div className="p-4">
                        {item.submenu.map((subItem) => (
                          <HoverLink
                            key={subItem.name}
                            to={subItem.href}
                            defaultText={subItem.name}
                            className="block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-100 hover:bg-gray-800/50 hover:text-emerald-400"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4"
          >
            {user ? (
              <> 
             
             <Button className="text-md font-semibold font-mono bg-gradient-to-r from-emerald-400 to-cyan-400 leading-6 text-center flex items-center text-white">
                {user.lastName} {user.firstName}
              </Button>
               
                <Button onClick={handleLogout} size="sm" className="bg-transparent border border-red-300 flex items-center text-xs p-1">
                  <LogOut className="w-3 h-3 mr-1" /> Logout
                </Button>
              </>
            ) : (
              <>
              <Button className="bg-gradient-to-r from-emerald-400 to-cyan-400" onClick={() => navigate('/login')}>Login</Button>
              <Button className="border border-gradient-to-r from-emerald-400 to-cyan-400" onClick={() => navigate('/register')}>Register</Button>
              </>
            )}
          </motion.div>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 top-[65px] p-4 mx-4 rounded-xl bg-gray-900/95 backdrop-blur-md shadow-lg ring-1 ring-white/10 lg:hidden"
              >
                <div className="flex flex-col p-4 space-y-4">
                  {navigation.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <button
                        className="flex items-center justify-between w-full text-left text-gray-100 font-medium"
                        onClick={() => setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                      >
                        {item.name}
                        <ChevronDown className={cn(
                          "h-4 w-4 transition-transform",
                          activeSubmenu === item.name ? "rotate-180" : ""
                        )} />
                      </button>
                      
                      <AnimatePresence>
                        {activeSubmenu === item.name && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 space-y-2">
                              {item.submenu.map((subItem) => (
                                <Link
                                  key={subItem.name}
                                  to={subItem.href}
                                  className="block text-sm text-gray-100"
                                  onClick={() => {
                                    setMobileMenuOpen(false)
                                    setActiveSubmenu(null)
                                  }}
                                >
                                  {subItem.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      {user ? (
                        <> 
                          <Button 
                            variant="ghost"
                            className="w-full justify-center bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-100"
                            asChild
                          >
                            
                          </Button>
                          <Button 
                            variant="ghost"
                            className="w-full justify-center text-gray-100"
                            asChild
                          >
                            <Link to="/login" onClick={handleLogout}>Logout</Link>
                          </Button>
                        </>
                      ) : (
                        <Button 
                          variant="ghost"
                          className="w-full justify-center bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-100"
                          asChild
                        >
                          <Link to="/login">Log In</Link>
                        </Button>

                        
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </div>
  )
}
