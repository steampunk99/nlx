import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, TrendingUp, Users, Network } from 'lucide-react'
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
    <div className="relative space-y-8 p-8 min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_-30%,#1a103b,transparent)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
            Investment Packages
          </h1>
          <p className="mt-2 text-cyan-300/80">Choose your path to digital prosperity</p>
        </motion.div>

        {/* Active Subscription Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 overflow-hidden"
        >
          <Card className="relative bg-black/40 backdrop-blur-sm border border-cyan-500/20 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader>
              <CardTitle className="text-cyan-100">My Active Subscription</CardTitle>
              <CardDescription className="text-cyan-300/60">View your current package details</CardDescription>
            </CardHeader>
            
            <CardContent>
              {packagesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <BorderTrail />
                </div>
              ) : userPackage ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-100">{userPackage.package.name}</h3>
                      <p className="text-sm text-cyan-300/60">Level {userPackage.package.level} Package</p>
                    </div>
                    <Badge 
                      className={cn(
                        "px-3 py-1",
                        userPackage.statusColor === 'red' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                        userPackage.statusColor === 'orange' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      )}
                    >
                      {userPackage.status}
                    </Badge>
                  </div>
                  
                  <div className="bg-black/20 border border-cyan-500/10 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-cyan-500/10 hover:bg-cyan-500/5">
                          <TableHead className="text-cyan-300/60">Price</TableHead>
                          <TableHead className="text-cyan-300/60">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="border-cyan-500/10 hover:bg-cyan-500/5">
                          <TableCell className="text-cyan-100 font-mono">
                            {currency.symbol} {formatAmount(userPackage.package.price)}
                          </TableCell>
                          <TableCell className="text-cyan-100">{userPackage.status}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-cyan-300/60">No active package. Choose your path below.</p>
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
          {availablePackages?.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover="hover"
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black/40 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 h-full flex flex-col">
                {/* Package Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <Star className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-cyan-100">{pkg.name}</h3>
                    <p className="text-sm text-cyan-300/60">Level {pkg.level}</p>
                  </div>
                </div>

                {/* Package Details */}
                <div className="space-y-4 flex-1">
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {currency.symbol} {formatAmount(pkg.price)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-100">Direct Commission: {pkg.directCommission}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-100">Level Commission: {pkg.levelCommission}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-100">Daily Reward: {pkg.dailyReward}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/20 border-none"
                  onClick={() => handlePackagePurchase(pkg)}
                >
                  Activate Package
                </Button>
              </div>
            </motion.div>
          ))}
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
