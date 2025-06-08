"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { useDashboardStats,useRewards, useEarnings, useRecentActivities } from "../../hooks/dashboard/useDashboard"
import { usePackages } from "../../hooks/payments/usePackages"
import { useCountry } from "../../hooks/config/useCountry"
import { useSiteConfig } from "../../hooks/config/useSiteConfig"
import { useCommissions } from "../../hooks/dashboard/useCommissions"

import { useQuery } from "@tanstack/react-query"
import { api } from "../../lib/axios"
import { Badge } from "@/components/ui/badge"

// --- Inline SVG React Components ---
function CocoaPod(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}><ellipse cx="16" cy="16" rx="13" ry="8" fill="#C97C3A"/><ellipse cx="16" cy="16" rx="9" ry="5" fill="#8D6748"/><ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#FFE066"/><path d="M16 8C18 10 20 14 16 24" stroke="#8D6748" strokeWidth="1.5"/><path d="M16 8C14 10 12 14 16 24" stroke="#8D6748" strokeWidth="1.5"/></svg>
  );
}
function Barn(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}><rect x="6" y="14" width="20" height="12" rx="2" fill="#FFE066" stroke="#C97C3A" strokeWidth="2"/><rect x="13" y="20" width="6" height="6" rx="1" fill="#B6D7B0"/><path d="M4 16L16 6l12 10" stroke="#B6D7B0" strokeWidth="2"/></svg>
  );
}
function Farmer(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}><circle cx="11" cy="13" r="5" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2"/><rect x="6" y="18" width="10" height="8" rx="3" fill="#FFE066" stroke="#B6D7B0" strokeWidth="2"/><rect x="18" y="18" width="8" height="8" rx="3" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2"/><circle cx="23" cy="13" r="4" fill="#FFE066" stroke="#8D6748" strokeWidth="2"/></svg>
  );
}
function Harvest(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}><ellipse cx="16" cy="20" rx="10" ry="5" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2"/><ellipse cx="16" cy="20" rx="5" ry="2.5" fill="#FFE066" stroke="#8D6748" strokeWidth="1.5"/><rect x="14" y="8" width="4" height="10" rx="2" fill="#C97C3A"/></svg>
  );
}
function Farmhouse(props) {
  return (
    <svg viewBox="0 0 32 32" fill="none" {...props}><rect x="8" y="14" width="16" height="10" rx="2" fill="#FFE066" stroke="#8D6748" strokeWidth="2"/><rect x="13" y="19" width="6" height="5" rx="1" fill="#B6D7B0"/><path d="M6 16L16 8l10 8" stroke="#B6D7B0" strokeWidth="2"/></svg>
  );
}

function DashboardOverview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats()
  const { data: recentActivities, isLoading: isLoadingActivities } = useRecentActivities()
  const { data: earnings, isLoading: isLoadingEarnings } = useEarnings()
  const { country, currency, formatAmount } = useCountry()
  const { commissions, commissionStats } = useCommissions()
  const { data: rewards } = useRewards()
  const { siteLogoUrl, promoImageUrl } = useSiteConfig()
  const { userPackage } = usePackages()
  const [activeQuest, setActiveQuest] = useState(null)
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Fetch withdrawal history
  const { data: withdrawalsData } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const response = await api.get("/withdrawals")
      return response.data.data
    },
  })

  const withdrawalHistory =
    withdrawalsData?.withdrawals?.map((withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      phone: withdrawal.details?.phone,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
    })) || []

  // Calculate total withdrawn amount
  const totalWithdrawn = withdrawalHistory.reduce(
    (total, withdrawal) => total + (withdrawal.status === "SUCCESSFUL" ? Number(withdrawal.amount) : 0),
    0,
  )

  const availableBalance = earnings?.availableBalance
  // Parse dailyReward as a float to ensure correct numeric value
  const dailyReward = rewards?.todayReward ? parseFloat(rewards.todayReward) : 0;
  console.log('Parsed dailyReward:', dailyReward, typeof dailyReward);

  if (isLoadingStats || isLoadingActivities) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  // --- Farm/Cocoa Themed Stat Icons ---
  const StatIcons = [Farmhouse, Harvest, Farmer, Barn];
  const statColors = [
    { color: '#8D6748', bg: 'from-[#e6f2ef]/80 to-[#ffe066]/60', iconBg: 'bg-[#ffe066]/60' },
    { color: '#B6D7B0', bg: 'from-[#b6d7b0]/40 to-[#ffe066]/30', iconBg: 'bg-[#b6d7b0]/60' },
    { color: '#A67C52', bg: 'from-[#ffe066]/40 to-[#b6d7b0]/30', iconBg: 'bg-[#ffe066]/60' },
    { color: '#C97C3A', bg: 'from-[#ffe066]/40 to-[#c97c3a]/20', iconBg: 'bg-[#c97c3a]/30' },
  ];

  // --- Farm/Cocoa Themed Stats (redesigned as 3D crates/signs, more playful, responsive) ---
  const stats = [
    {
      title: 'Farm Balance',
      value: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      description: 'Your available cocoa earnings',
      icon: Farmhouse,
      color: '#8D6748',
      bg: 'from-[#e6f2ef]/80 to-[#ffe066]/60',
      iconBg: 'bg-[#ffe066]/60',
      secondaryValue: `${currency.symbol} ${formatAmount(availableBalance || 0)}`,
      secondaryLabel: 'This month',
    },
    {
      title: 'Harvested Today',
      value: `${currency.symbol} ${formatAmount(dailyReward)}`,
      description: 'Cocoa harvested today',
      icon: Harvest,
      color: '#B6D7B0',
      bg: 'from-[#b6d7b0]/40 to-[#ffe066]/30',
      iconBg: 'bg-[#b6d7b0]/60',
      secondaryValue: `${currency.symbol} ${formatAmount(dailyReward)}`,
      secondaryLabel: '24h Change',
    },
    {
      title: 'Farmers in Network',
      value: dashboardStats?.networkSize || '0',
      description: 'Active farmers in your network',
      icon: Farmer,
      color: '#A67C52',
      bg: 'from-[#ffe066]/40 to-[#b6d7b0]/30',
      iconBg: 'bg-[#ffe066]/60',
      secondaryValue: dashboardStats?.networkSize || '0',
      secondaryLabel: 'Total Farmers',
    },
    {
      title: 'Cocoa Investment',
      value: userPackage ? 'ACTIVE' : 'NONE',
      description: 'Current cocoa investment',
      icon: Barn,
      color: '#C97C3A',
      bg: 'from-[#ffe066]/40 to-[#c97c3a]/20',
      iconBg: 'bg-[#c97c3a]/30',
      secondaryValue: `${currency.symbol} ${formatAmount(userPackage?.package?.price || 0)}`,
      secondaryLabel: 'Package Value',
    },
  ];

  // --- Farm/Cocoa Themed Activity Feed ---
  const getActivityIcon = (type) => {
    switch (type) {
      case 'commission':
        return Harvest;
      case 'referral':
        return Farmer;
      default:
        return CocoaPod;
    }
  };
  const getActivityColor = (type) => {
    switch (type) {
      case 'commission':
        return { bg: 'bg-[#b6d7b0]/40', text: 'text-[#8D6748]', ring: 'ring-[#b6d7b0]/20' };
      case 'referral':
        return { bg: 'bg-[#ffe066]/40', text: 'text-[#A67C52]', ring: 'ring-[#ffe066]/20' };
      default:
        return { bg: 'bg-[#c97c3a]/40', text: 'text-[#C97C3A]', ring: 'ring-[#c97c3a]/20' };
    }
  };
  const getActivityEmoji = (type) => {
    switch (type) {
      case 'commission':
        return '💰';
      case 'referral':
        return '💰';
      default:
        return '💰';
    }
  };

  // Format date to display like "Jan 1, 2023"
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

 

  // --- Special Offer Description (simulate backend) ---
  const specialOfferDescription = "This season, boost your cocoa farm with our exclusive Elite Barn Package! Enjoy higher yields, faster harvests, and special farm tools. Upgrade now and watch your virtual world flourish.";

  return (
    <div className="relative space-y-6 p-0 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] min-h-screen overflow-x-hidden">
      {/* Immersive Cocoa Farm World Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <CocoaPod className="absolute left-0 top-0 w-40 h-40 opacity-10" />
        <Barn className="absolute right-0 bottom-0 w-48 h-48 opacity-10" />
        <Harvest className="absolute left-1/2 -translate-x-1/2 bottom-10 w-32 h-32 opacity-5" />
        {/* Animated clouds */}
        <svg className="absolute top-10 left-1/4 w-32 h-12 animate-cloud-move" viewBox="0 0 100 40"><ellipse cx="30" cy="20" rx="30" ry="12" fill="#fffbe6"/><ellipse cx="60" cy="20" rx="20" ry="10" fill="#e6f2ef"/></svg>
        <svg className="absolute top-20 right-1/4 w-40 h-16 animate-cloud-move2" viewBox="0 0 120 50"><ellipse cx="50" cy="25" rx="40" ry="15" fill="#fffbe6"/><ellipse cx="90" cy="25" rx="25" ry="12" fill="#e6f2ef"/></svg>
        {/* Animated birds */}
        <svg className="absolute top-32 left-1/3 w-16 h-8 animate-bird-fly" viewBox="0 0 40 20"><path d="M2 10 Q10 2 20 10 Q30 18 38 10" stroke="#8d6748" strokeWidth="2" fill="none"/></svg>
      </div>
      {/* Main Content (z-10) */}
      <div className="relative z-10 px-0 md:px-8 lg:px-16 pt-10 pb-8">
        {/* Farm Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Farmhouse className="w-16 h-16 md:w-24 md:h-24 drop-shadow-lg" />
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#8D6748] font-cursive drop-shadow-sm">
                Welcome to Your Cocoa Farm, {user?.firstName || 'Farmer'}!
              </h1>
              <p className="text-[#A67C52]/80 font-medium text-lg md:text-xl mt-2">Grow, harvest, and earn in your own virtual cocoa world.</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={() => navigate('/dashboard/network')}
              className="bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/80 hover:to-[#ffe066]/80 text-[#4e3b1f] font-bold shadow-lg border border-[#b6d7b0]/40 text-lg px-6 py-3 rounded-2xl"
            >
              <Farmer className="mr-2 h-6 w-6" />
              Invite others
            </Button>
          </div>
        </div>
        {/* Redesigned Farm Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Credit Card/Vault Style Component for Farm Balance and Harvested Today */}
          <motion.div 
            className="md:col-span-2 bg-gradient-to-br from-[#fffbe6] to-[#e6f2ef] rounded-xl shadow-xl overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="p-4 md:p-6 relative bg-gradient-to-br from-[#ffe066]/40 to-[#b6d7b0]/20 h-full">
              {/* Farmhouse decoration in top right */}
              <div className="absolute scale-2 top-5 right-5 opacity-70">
              
              </div>
              
              {/* Left border accent */}
              <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#b6d7b0] to-[#ffe066]" />
              
              {/* Card Content */}
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#8D6748] mb-1 ml-3 font-cursive">Farm Wallet</h3>
                  <div className="flex items-center gap-2 ml-3">
                    <Wallet className="w-5 h-5 text-[#C97C3A]" />
                    <span className="text-xs text-[#A67C52]/70">User: {user?.firstName} {user?.lastName}</span>
                  </div>
                </div>
                
                <div className="my-6 md:my-8 ml-3 space-y-2">
                  <div className="text-3xl md:text-4xl font-bold tracking-wide text-[#4e3b1f]">
                    {currency.symbol} {formatAmount(availableBalance || 0)}
                  </div>
                  <p className="text-sm text-[#8D6748]/80">Available Balance</p>
                </div>
                
                {/* Chip decoration */}
               
               
              </div>
            </div>
          </motion.div>
          
          {/* Network Display */}
          <div className="grid grid-cols-1 gap-6">
            {/* Farmers in Network Card */}
            <motion.div
              className="bg-gradient-to-br from-[#fffbe6] to-[#e6f2ef] rounded-xl shadow-lg overflow-hidden relative hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute left-0 top-0 h-full w-2 bg-[#ffe066]" />
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-[#A67C52] mb-1">Farmers in Network</h3>
                  <div className="text-2xl font-bold text-[#4e3b1f]">{dashboardStats?.networkSize || '0'}</div>
                  <p className="text-xs text-[#8D6748]/70 mt-1">Active farmers in your network</p>
                </div>
                <div className="bg-[#ffe066]/30 p-3 rounded-full">
                  <Farmer className="w-12 h-12" />
                </div>
              </div>
            </motion.div>
            
            {/* Barn Package Card */}
            <motion.div
              className="bg-gradient-to-br from-[#fffbe6] to-[#e6f2ef] rounded-xl shadow-lg overflow-hidden relative hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute left-0 top-0 h-full w-2 bg-[#C97C3A]" />
              <div className="p-4 flex justify-between items-center">
                <div>
                  {/* <h3 className="text-lg font-semibold text-[#C97C3A] mb-1">Cocoa Investment</h3> */}
                  <div className="flex items-center gap-2">
                    <div className={`text-lg font-bold ${userPackage ? 'text-green-600' : 'text-[#4e3b1f]'}`}>
                      {userPackage ? 'ACTIVE' : 'NONE'}
                    </div>
                    {userPackage && (
                      <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {userPackage.package?.name || 'Standard'}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#8D6748]/70 mt-1">Current pan</p>
                </div>
                <div className="bg-[#C97C3A]/20 p-3 rounded-full">
                  <Barn className="w-12 h-12" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Activity Feed as Farm Notice Board with Expandable Cards on Mobile */}
        <div className="max-w-4xl bg-[#fffbe6]/80 border-2 border-[#ffe066]/40 rounded-3xl shadow-2xl p-8 relative overflow-hidden mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <CocoaPod className="w-10 h-10" />
            <span className="text-2xl min-w-full font-cursive text-[#C97C3A] drop-shadow">Farm Activities</span>
          </div>
          <div className="mt-10 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {recentActivities?.length === 0 && (
              <div className="text-center text-[#8D6748]/70 py-10">No recent farm activity yet. Start growing your cocoa world!</div>
            )}
            {recentActivities?.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const colors = getActivityColor(activity.type);
              const emoji = getActivityEmoji(activity.type);
              const isNew = index === 0;
              const isExpanded = expandedActivity === index;
              return (
                <motion.div
                  key={index}
                  className={
                    "relative bg-[#e6f2ef]/80 border border-[#b6d7b0]/30 rounded-xl flex items-center gap-4 group hover:scale-[1.02] transition-transform cursor-pointer " +
                    (isExpanded ? "z-20 shadow-2xl scale-105" : "")
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  onClick={() => setExpandedActivity(isExpanded ? null : index)}
                >
                  <div className="flex-shrink-0 ml-3 w-14 h-14 rounded-full bg-gradient-to-br from-[#ffe066]/40 to-[#b6d7b0]/30 border-2 border-[#ffe066]/30 flex items-center justify-center text-2xl">
                    {emoji}
                  </div>
                  <div className={
                    "flex-1 min-w-0 transition-all duration-300 " +
                    (isExpanded ? "py-6" : "py-3")
                  }>
                    <div className="flex items-start justify-between gap-2">
                      <p className={
                        "font-medium text-[#8D6748] truncate text-lg transition-all duration-300 " +
                        (isExpanded ? "whitespace-normal break-words text-base md:text-lg" : "")
                      }>
                       <Badge className="mr-2" variant="outline">{activity.type}</Badge> 
                      </p>
                      {activity?.amount && (
                        <p className="flex-shrink-0 text-[#C97C3A] font-bold text-lg">
                          {currency.symbol} {formatAmount(activity?.amount)}
                        </p>
                      )}
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2"
                        >
                          <div className="text-sm text-[#A67C52] whitespace-pre-line">
                            {activity.description || 'No additional details.'}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <p className="text-[#A67C52]/60">{formatDate(activity?.date)}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-[#ffe066]/20 text-[#A67C52] border border-[#ffe066]/30">
                        <ActivityIcon className="h-4 w-4" />
                        {activity.type}
                      </span>
                    </div>
                  </div>
                  {isNew && (
                    <span className="absolute right-4 top-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c97c3a] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c97c3a]"></span>
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
        {/* Special Offer / Promo Image with Modal and Description */}
        <motion.div
          className="bg-gradient-to-br from-[#b6d7b0]/70 to-[#ffe066]/70 border border-[#b6d7b0]/40 rounded-xl overflow-hidden relative mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 relative flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c97c3a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c97c3a]"></span>
                  </span>
                </motion.div>
                <h2 className="text-xl font-bold text-[#C97C3A] font-cursive">Special Farm Offer</h2>
              </div>
              <p className="text-[#8D6748] text-lg mb-4 whitespace-pre-line">{specialOfferDescription}</p>
            </div>
            {promoImageUrl && (
              <div className="flex-shrink-0 cursor-pointer" onClick={() => setShowOfferModal(true)}>
                <motion.img
                  src={promoImageUrl}
                  alt="Promotional Offer"
                  className="w-100 h-56 object-cover rounded-lg shadow-xl border-2 border-[#ffe066]/40 hover:scale-105 transition-transform"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  onError={e => {
                    const target = e.target;
                    if (target instanceof HTMLImageElement) {
                      target.onerror = null;
                      target.src = '/placeholder-promo.jpg';
                    }
                  }}
                />
                <div className="text-xs text-center text-[#A67C52] mt-2">Tap to view</div>
              </div>
            )}
          </div>
          {/* Modal for viewing offer image */}
          {showOfferModal && promoImageUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setShowOfferModal(false)}>
              <div className="relative max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
                <img src={promoImageUrl} alt="Special Offer Full" className="w-full h-auto rounded-xl shadow-2xl border-4 border-[#ffe066]/60" />
                <button
                  className="absolute top-2 right-2 bg-[#ffe066] text-[#8d6748] rounded-full px-3 py-1 font-bold shadow hover:bg-[#b6d7b0] transition"
                  onClick={() => setShowOfferModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Wallet component for the icon
function Wallet(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  )
}

export default DashboardOverview
