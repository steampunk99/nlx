import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"
import defaultImg from "@/assets/golden.png"
import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"

const PackageCard = ({ pkg, index, onPurchase, currency, formatAmount }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Memoized calculations to avoid recalculation on every render
  const calculations = useMemo(() => {
    const price = Number(pkg.price) || 0
    const dailyMultiplier = Number(pkg.dailyMultiplier) || 0
    const duration = Number(pkg.duration) || 0
    const dailyIncome = (dailyMultiplier / 100) * price
    const totalRevenue = dailyIncome * duration
    
    return { price, dailyIncome, totalRevenue, duration }
  }, [pkg.price, pkg.dailyMultiplier, pkg.duration])

  const img = pkg.imageUrl || defaultImg
  const rating = pkg.rating || ((index % 5) + 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Subtle shadow layer */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-slate-600/10 rounded-3xl"
        animate={{
          scale: isHovered ? 1.02 : 1,
          opacity: isHovered ? 0.8 : 0.3
        }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-200/50 overflow-hidden transition-all duration-500 hover:border-slate-300/70">
        {/* Subtle top accent */}
        <div 
          className="h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400"
          style={{
            background: `linear-gradient(90deg, 
              hsl(${220 + (index * 30) % 180}, 8%, 20%) 0%, 
              hsl(${220 + (index * 30) % 180}, 12%, 35%) 50%, 
              hsl(${220 + (index * 30) % 180}, 8%, 45%) 100%)`
          }}
        />
        
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Image Container */}
            <motion.div 
              className="relative flex-shrink-0 mx-auto lg:mx-0"
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                rotateY: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-32 h-32 lg:w-36 lg:h-36 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 to-amber-200/60 rounded-2xl transform rotate-3" />
                <img 
                  src={img} 
                  alt={pkg.name}
                  className="relative w-full h-full object-cover rounded-2xl shadow-lg"
                  loading="lazy"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl" />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              {/* Title and Rating */}
              <div className="space-y-2">
                <h3 className="text-xl lg:text-2xl font-light text-slate-900 tracking-wide">
                  {pkg.name}
                </h3>
                <div className="flex items-center justify-center lg:justify-start gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          i < rating 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-slate-500 font-light">Price</div>
                  <div className="font-medium text-slate-900">
                    {currency.symbol} {formatAmount(calculations.price)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-light">Duration</div>
                  <div className="font-medium text-slate-900">
                    {calculations.duration} days
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-light">Daily Income</div>
                  <div className="font-medium text-emerald-700">
                    {currency.symbol} {formatAmount(calculations.dailyIncome)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-500 font-light">Total Return</div>
                  <div className="font-semibold text-emerald-800">
                    {currency.symbol} {formatAmount(calculations.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 flex justify-center lg:justify-end">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => onPurchase(pkg)}
                  className="group relative px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-light tracking-wide rounded-2xl transition-all duration-300 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-900"
                    initial={{ x: '-100%' }}
                    animate={{ x: isHovered ? '0%' : '-100%' }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="relative flex items-center gap-2">
                    Select
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ActivationPage() {
  const navigate = useNavigate();
  const { country, currency, formatAmount } = useCountry();
  const { user } = useAuth();
  const { availablePackages, packagesLoading } = usePackages();

  console.log("Available Packages:", availablePackages);

  const handlePackagePurchase = (pkg) => {
    if (user.country === "UG") {
      setTimeout(() => {
        navigate("/activate/payment", { state: { selectedPackage: pkg } });
      }, 1000);
    } else {
      setTimeout(() => {
        navigate("/manual-payment", { state: { selectedPackage: pkg } });
      }, 1000);
    }
  };

  if (packagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(0,0,0,0.05)_1px,_transparent_0)] bg-[length:24px_24px] opacity-30" />
      
      <div className="relative">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-16 pb-12 px-4"
        >
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extralight text-slate-900 tracking-wide">
              Get <span className="font-light">started</span>
            </h1>
           
          </div>
        </motion.div>

        {/* Packages Container */}
        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence>
              {availablePackages.length > 0 ? (
                <div className="space-y-6 lg:space-y-8">
                  {availablePackages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id || index}
                      pkg={pkg}
                      index={index}
                      onPurchase={handlePackagePurchase}
                      currency={currency}
                      formatAmount={formatAmount}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-light text-slate-700">
                      No packages available
                    </h3>
                    <p className="text-slate-500 font-light">
                      Please check back later for new investment opportunities.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}