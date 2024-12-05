import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

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
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white shadow-lg shadow-black/[0.03]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 lg:px-8" aria-label="Global">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex lg:flex-1"
        >
          <Link to="/" className="-m-1.5 p-1.5 transition duration-300 hover:opacity-80">
            <span className="sr-only">Zillionaire</span>
            <h1 className="text-2xl font-bold text-[#0095E7]">
              Zillionaire
            </h1>
          </Link>
        </motion.div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </motion.button>
        </div>

        {/* Desktop navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:gap-x-8"
        >
          {navigation.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setActiveSubmenu(item.name)}
              onMouseLeave={() => setActiveSubmenu(null)}
              className="relative"
            >
              <Link
                to={item.href}
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-[#0095E7] transition-colors py-2"
              >
                {item.name}
                <ChevronDown className="h-4 w-4" />
              </Link>
              
              {activeSubmenu === item.name && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-lg py-2 mt-1">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.name}
                      to={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0095E7]"
                      onClick={() => setActiveSubmenu(null)}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-6"
        >
          <Button 
            variant="ghost"
            className="text-gray-900 hover:text-[#0095E7] font-medium"
            asChild
          >
            <Link to="/login">Log In</Link>
          </Button>
          
          <Button 
            className="bg-[#0095E7] text-white hover:bg-[#0077B6] transition-colors"
            asChild
          >
            <Link to="/register">Get Started</Link>
          </Button>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 top-[57px] z-50 bg-white lg:hidden"
            >
              <div className="flex flex-col p-4 space-y-4">
                {navigation.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <button
                      className="flex items-center justify-between w-full text-left text-gray-900 font-medium"
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
                                className="block text-sm text-gray-700"
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
                      className="w-full justify-center text-gray-900"
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
  )
}
