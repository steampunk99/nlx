import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Check, Star, CheckCircle2, Sparkles, ArrowRight, Shield, Zap, Trophy, Copy, Info } from "lucide-react"
import { usePackages } from "@/hooks/payments/usePackages"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/auth/useAuth"
import { useNavigate } from "react-router-dom"
import defaultImg from "@/assets/golden.jpg"
import { useCountry } from "@/hooks/config/useCountry"
import ReactCountryFlag from "react-country-flag"
import api from "@/lib/axios"
import { useQuery } from "@tanstack/react-query"
import { toast } from "react-hot-toast"

const getDetectedCategory = (pkg) => {
  if (!pkg) return 'Other'
  // Prefer explicit category field if it exists
  if (pkg.category && typeof pkg.category === 'string') return pkg.category
  // Heuristics based on common names in DB
  const name = `${pkg.name || ''} ${pkg.description || ''}`.toLowerCase()
  if (name.includes('trinitario')) return 'Trinitario'
  if (name.includes('forastero')) return 'Forastero'
  if (name.includes('criollo')) return 'Criollo'
  return 'Other'
}

const categoryFallbackImages = {
  Trinitario: [defaultImg, defaultImg],
  Forastero: [defaultImg, defaultImg],
  Criollo: [defaultImg, defaultImg],
  Other: [defaultImg, defaultImg]
}

const getFallbackImage = (category, index) => {
  const list = categoryFallbackImages[category] || categoryFallbackImages.Other
  return list[index % list.length] || defaultImg
}

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

  const detectedCategory = getDetectedCategory(pkg)
  const img = pkg.imageUrl || getFallbackImage(detectedCategory, index)
  
  const rating = pkg.rating || ((index % 5) + 1)
  const featured = pkg.featured || index === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <div className="relative h-full bg-white rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:border-slate-300 flex flex-col">
        {/* Subtle top accent */}
        <div 
          className="h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400"
        />
        {/* Image */}
        <div className="p-6 pb-0">
          <div className="w-full aspect-[4/3] relative overflow-hidden rounded-xl">
            <img 
              src={img}
              alt={pkg.name}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="space-y-3 text-center">
            {/* Title and Badge */}
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg lg:text-xl font-medium text-slate-900 tracking-wide">
                {pkg.name}
              </h3>
              {featured && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-xs font-medium" title="Most picked by our community">Popular</span>
              )}
            </div>
            {/* Rating */}
            {/* <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
            </div> */}
          </div>

          {/* Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-500 font-light flex items-center gap-1">Price <Info className="w-3.5 h-3.5 text-slate-400" title="Upfront package cost" /></div>
              <div className="font-medium text-slate-900" title={`Package price: ${currency.symbol} ${formatAmount(calculations.price)}`}>{currency.symbol} {formatAmount(calculations.price)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500 font-light flex items-center gap-1">Duration <Info className="w-3.5 h-3.5 text-slate-400" title="Total running days" /></div>
              <div className="font-medium text-slate-900" title={`${calculations.duration} active earning days`}>{calculations.duration} days</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500 font-light flex items-center gap-1">Daily Income <Info className="w-3.5 h-3.5 text-slate-400" title="Estimated daily earnings" /></div>
              <div className="font-medium text-emerald-700" title={`Daily income: ${currency.symbol} ${formatAmount(calculations.dailyIncome)}`}>{currency.symbol} {formatAmount(calculations.dailyIncome)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500 font-light flex items-center gap-1">Total Return <Info className="w-3.5 h-3.5 text-slate-400" title="Sum of daily income across duration" /></div>
              <div className="font-semibold text-emerald-800" title={`Total return: ${currency.symbol} ${formatAmount(calculations.totalRevenue)}`}>{currency.symbol} {formatAmount(calculations.totalRevenue)}</div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <Button
              onClick={() => onPurchase(pkg)}
              className="w-full group relative px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-medium tracking-wide rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              title="Activate this package"
            >
              <span className="relative flex items-center justify-center gap-2">
                Activate this package
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
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
  // Build categories dynamically from data + include a default 'All'
  const dynamicCategories = useMemo(() => {
    const set = new Set(['All'])
    for (const p of availablePackages || []) {
      set.add(getDetectedCategory(p))
    }
    return Array.from(set)
  }, [availablePackages])
  const [activeTab, setActiveTab] = useState('All');

  console.log("Available Packages:", availablePackages);

  const tabs = dynamicCategories;
  
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
    if (!availablePackages || availablePackages.length === 0) return []
    if (activeTab === 'All') return availablePackages
    return availablePackages.filter((pkg) => getDetectedCategory(pkg) === activeTab)
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
              GET <span className="font-light">STARTED</span>
            </h1>
            <p className="text-slate-600 mt-6 font-light max-w-2xl mx-auto leading-relaxed">
              Create account → Choose cocoa package → Start earning daily.

            </p>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="px-4 pb-4"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Enterprise-level security</span>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Daily Prizes</span>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Daily earnings</span>
            </div>
            <div className="bg-white/80 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">Flexible withdrawals</span>
            </div>
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
                    <div className="text-slate-800 text-sm truncate px-3 py-2 border border-slate-200 rounded-lg bg-white" title={referralLinkData?.referralLink || ""}>
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
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8"
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