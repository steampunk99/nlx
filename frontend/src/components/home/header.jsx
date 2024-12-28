import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { HoverLink } from "../ui/hover-link"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"
import logo from '@/assets/logo.png'

const navigation = [
  { 
    name: "Features",
    href: "/#features",
    submenu: [
      { name: "Earn More", href: "/#features" },
      { name: "Build Teams", href: "/#features" },
      { name: "Track Growth", href: "/#features" },
      { name: "Secure Platform", href: "/#features" },
    ]
  },
  { 
    name: "Packages",
    href: "/#packages",
    submenu: [
      { name: "Starter Package", href: "/#packages" },
      { name: "Professional Package", href: "/#packages" },
      { name: "Enterprise Package", href: "/#packages" },
    ]
  },
  { 
    name: "About",
    href: "/about",
    submenu: [
      { name: "Our Company", href: "/about" },
      { name: "Contact Us", href: "/contact" },
    ]
  },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-50 px-4 py-4">
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
           
            </motion.div>
            <Link
              to="/"
              className="flex items-center gap-2 transition duration-300 hover:opacity-80"
            >
              <span className="sr-only"></span>
              <h1 className={cn(
                "font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent transition-all duration-300",
                isScrolled ? "text-lg" : "text-xl"
              )}>
                Earn Drip
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
            transition={{ duration: 0.5 }}
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
            <Button variant="ghost" className="hover:bg-transparent border border-emerald-400 transition-ease duration-300 hover:border hover:border-emerald-600">
              <HoverLink 
                to="/login"
                defaultText="Sign in"
                className="text-sm font-medium text-emerald-400 transition-colors duration-200"
              />
            </Button>
            <Button 
              asChild
              className="bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-500 hover:to-cyan-500 text-gray-900 font-medium transition-all duration-300"
            >
              <HoverLink 
                to="/register" 
                defaultText="Get Started"
                className="text-sm font-medium"
              />
            </Button>
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
                      <Button 
                        variant="ghost"
                        className="w-full justify-center text-gray-100"
                        asChild
                      >
                        <Link to="/login">Log In</Link>
                      </Button>
                      
                      <Button 
                        className="w-full justify-center bg-[#0095E7] text-white hover:bg-[#0077B6]"
                        asChild
                      >
                        <Link to="/register">Get Started</Link>
                      </Button>
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
