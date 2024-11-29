import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "../../lib/utils"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Packages", href: "/#packages" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        "fixed inset-x-0 top-0 z-50 backdrop-blur-lg transition-all duration-500",
        isScrolled
          ? "bg-gradient-to-r from-white/90 via-white/95 to-white/90 shadow-lg shadow-black/[0.03]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex lg:flex-1"
        >
          <Link to="/" className="-m-1.5 p-1.5 transition duration-300 hover:opacity-80">
            <span className="sr-only">Zillionaire</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
              Zillionaire
            </h1>
          </Link>
        </motion.div>
        
        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 hover:text-teal-600 transition-colors"
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
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:flex lg:gap-x-12"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="relative text-sm font-semibold leading-6 text-gray-900 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="relative z-10">{item.name}</span>
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-teal-500 to-orange-500 scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4"
        >
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-300"
            asChild
          >
            <Link to="/login">Log in</Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:from-teal-600 hover:to-orange-600 transition-all duration-300"
            asChild
          >
            <Link to="/register">Get Started</Link>
          </Button>
        </motion.div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-x-0 top-[73px] z-50 bg-white/95 backdrop-blur-lg shadow-lg shadow-black/[0.03] lg:hidden"
            >
              <div className="flex flex-col space-y-4 p-6">
                {navigation.map((item) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={item.href}
                      className="block text-base font-semibold leading-7 text-gray-900 hover:text-teal-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <div className="flex flex-col space-y-3 pt-4">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-center text-gray-700 hover:text-teal-600 hover:bg-teal-50"
                    asChild
                  >
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button
                    className="w-full justify-center bg-gradient-to-r from-teal-500 to-orange-500 text-white shadow-md hover:shadow-lg transition-shadow"
                    asChild
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}
