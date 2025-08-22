import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import defaultImg from "@/assets/golden.jpg"

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

import { Button } from "@/components/ui/button"
import { Check, Star, TrendingUp, Users, Network, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { usePackages } from '@/hooks/payments/usePackages'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/auth/useAuth'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { BorderTrail } from '@/components/ui/border-trail'
import { cn } from '@/lib/utils'
import { UpgradePackageModal } from '@/pages/dashboard/packages/upgrade-package-modal'
import { useCountry } from '@/hooks/config/useCountry'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400
    }
  }
}

export default function PackagesPage() {
  const navigate = useNavigate()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { country, currency, formatAmount } = useCountry()

  const {
    availablePackages, 
    userPackage,
    upgradeOptions,
    packagesLoading,
    purchasePackage,
    upgradePackage
  } = usePackages()

  console.log('Packages Page Data:', {
    available: availablePackages,
    user: userPackage
  });

  const handlePackagePurchase = (pkg) => {
    navigate('/activate/payment', { state: { selectedPackage: pkg } });
  }

  const handleUpgrade = (pkg) => {
    setSelectedPackage(pkg)
    setShowUpgradeModal(true)
  }

  if (packagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8 p-8 min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Mineral Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,rgba(251,191,36,0.1),transparent)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-4xl">🏪</span>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600">
              My Store
            </h1>
            <span className="text-4xl">💎</span>
          </div>
          <p className="mt-2 text-amber-700/80 font-medium">Discover and manage your mineral trading packages</p>
        </motion.div>

        {/* Active Mineral Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden"
        >
          <Card className="relative bg-gradient-to-br from-amber-50/90 to-orange-50/90 backdrop-blur-sm border-2 border-amber-200/50 overflow-hidden group hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-400/10 to-yellow-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <CardTitle className="text-amber-900 text-xl font-bold">Active Mineral</CardTitle>
                  <CardDescription className="text-amber-700/70">Your current mining operation</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {packagesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent"></div>
                </div>
              ) : userPackage ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-xl border border-amber-200/50">
                    {/* Mineral Image */}
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
                      <img src={userPackage.package.imageUrl || userPackage.package.img || getFallbackImage(getDetectedCategory(userPackage.package), 0)} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-900">{userPackage.package.name}</h3>
                      <p className="text-amber-700/80 font-medium">Level {userPackage.package.level} Mining Operation</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-amber-800">
                          {currency.symbol} {formatAmount(userPackage.package.price)}
                        </span>
                        <Badge 
                          className={cn(
                            "px-2 py-1 text-xs font-semibold",
                            userPackage.statusColor === 'red' ? 'bg-red-100 text-red-700 border-red-200' : 
                            userPackage.statusColor === 'orange' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            'bg-green-100 text-green-700 border-green-200'
                          )}
                        >
                          {userPackage.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                    <span className="text-4xl">⚡</span>
                  </div>
                  <p className="text-amber-700/70 font-medium">No active mineral. Start your mining journey below!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Packages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {availablePackages?.filter(pkg => pkg.id !== userPackage?.package?.id).map((pkg, index) => {
            const calculations = {
              price: Number(pkg.price) || 0,
              dailyMultiplier: Number(pkg.dailyMultiplier) || 0,
              duration: Number(pkg.duration) || 0,
              dailyIncome: (Number(pkg.dailyMultiplier) / 100) * Number(pkg.price) || 0,
              totalRevenue: ((Number(pkg.dailyMultiplier) / 100) * Number(pkg.price)) * (Number(pkg.duration) || 0) || 0
            };

            const detectedCategory = getDetectedCategory(pkg);
            const img = pkg.imageUrl || getFallbackImage(detectedCategory, index);
            
            return (
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                whileHover="hover"
                className="group relative h-full"
              >
                <div className="relative h-full bg-white rounded-2xl border border-slate-200/60 overflow-hidden transition-all duration-300 hover:border-slate-300 flex flex-col">
                  {/* Subtle top accent */}
                  <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
                  
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
                        {index === 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs font-medium">Popular</span>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="text-slate-500 font-light">Price</div>
                        <div className="font-medium text-slate-900">{currency.symbol} {formatAmount(calculations.price)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-light">Duration</div>
                        <div className="font-medium text-slate-900">{calculations.duration} days</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-light">Daily Income</div>
                        <div className="font-medium text-amber-700">{currency.symbol} {formatAmount(calculations.dailyIncome)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-light">Total Return</div>
                        <div className="font-semibold text-amber-800">{currency.symbol} {formatAmount(calculations.totalRevenue)}</div>
                      </div>
                    </div>


                    {/* CTA */}
                    <div className="mt-6">
                      <Button
                        onClick={() => handlePackagePurchase(pkg)}
                        className="w-full group relative px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium tracking-wide rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      >
                        <span className="relative flex items-center justify-center gap-2">
                          upgrade
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Upgrade Package Modal */}
        <UpgradePackageModal 
          open={showUpgradeModal}
          onClose={() => {
            setShowUpgradeModal(false)
            setSelectedPackage(null)
          }}
          currentPackage={selectedPackage}
          availablePackages={availablePackages?.filter(pkg => 
            pkg.level > (selectedPackage?.level || 0)
          )}
        />
      </div>
    </div>
  );
}
