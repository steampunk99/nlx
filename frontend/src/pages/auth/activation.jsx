import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy, Copy } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"
import defaultImg from "@/assets/golden.png"
import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"
import api from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

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
                  className="group relative px-8 py-3 bg-green-900 hover:bg-slate-800 text-white font-light tracking-wide rounded-2xl transition-all duration-300 overflow-hidden"
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
  const [activeTab, setActiveTab] = useState("Trinitario");

  console.log("Available Packages:", availablePackages);

  const tabs = ["Trinitario", "Forastero", "Criollo"];
  
  // Referral link fetch — allow users to share even before activation
  const { data: referralLinkData } = useQuery({
    queryKey: ["referralLink"],
    queryFn: async () => {
      const response = await api.get("/network/referral-link");
      return response.data.data;
    },
  });

  const handleCopyLink = () => {
    if (referralLinkData?.referralLink) {
      navigator.clipboard
        .writeText(referralLinkData.referralLink)
        .then(() => {
          toast.success("Copied");
        })
        .catch(() => toast.error("Copy failed"));
    }
  };

  const handleShare = async () => {
    const link = referralLinkData?.referralLink;
    if (!link) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join me on Earn Drip",
          text: "Sign up using my referral link:",
          url: link,
        });
        toast.success("Shared");
      } else {
        await navigator.clipboard.writeText(link);
        toast.success("Copied (share unavailable)");
      }
    } catch (err) {
      toast.error("Share failed");
    }
  };

  const filteredPackages = useMemo(() => {
    return availablePackages.filter(pkg => 
      pkg.description === activeTab
    );
  }, [availablePackages, activeTab]);

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
          className="pt-16 pb-8 px-4"
        >
          <div className="max-w-4xl mx-auto text-center mt-12">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extralight text-slate-900 tracking-wide">
              Get <span className="font-light">Started</span>
            </h1>
            <p className="text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              Carefully curated selection of opportunities,
              
            </p>
          </div>
        </motion.div>

        {/* Referral Section — available pre-activation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-4 pb-4"
        >
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl p-[1px] bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-emerald-500/30">
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-[10px] p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Referral link</div>
                    <div className="text-slate-800 text-sm truncate px-3 py-2 border border-slate-200 rounded-lg bg-white">
                      {referralLinkData?.referralLink || "Generating..."}
                    </div>
                  </div>
                  <Button 
                    onClick={handleCopyLink} 
                    variant="outline" 
                    className="h-10 w-full sm:w-10 p-0 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50"
                    aria-label="Copy link"
                    disabled={!referralLinkData?.referralLink}
                  >
                    <Copy className="h-4 w-4 text-emerald-700" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="px-4 pb-8"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center">
              <div className="bg-white/60 px-4 sm:px-8 pb-8 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50 shadow-sm">
                {/* Mobile Select (fallback) */}
                <div className="sm:hidden mb-3">
                  <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {tabs.map((tab) => (
                      <option key={tab} value={tab}>{tab}</option>
                    ))}
                  </select>
                </div>

                {/* Scrollable chip row */}
                <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-4 py-2 md:px-6 md:py-3 rounded-xl font-light tracking-wide transition-all duration-300 shrink-0 whitespace-nowrap snap-start ${
                        activeTab === tab
                          ? 'text-white shadow-lg'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                      aria-pressed={activeTab === tab}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-green-600 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{tab}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Packages Container */}
        <div className="px-4 pb-20">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {filteredPackages.length > 0 ? (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 lg:space-y-8"
                >
                  {filteredPackages.map((pkg, index) => (
                    <PackageCard
                      key={pkg.id || index}
                      pkg={pkg}
                      index={index}
                      onPurchase={handlePackagePurchase}
                      currency={currency}
                      formatAmount={formatAmount}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20"
                >
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-light text-slate-700">
                      No {activeTab} packages available
                    </h3>
                    <p className="text-slate-500 font-light">
                      Please check other categories or come back later for new investment opportunities.
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