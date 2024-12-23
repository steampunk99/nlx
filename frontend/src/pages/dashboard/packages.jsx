import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Check, Star, TrendingUp, Users, Network } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog'
import { usePackages } from '../../hooks/usePackages'
import { motion } from 'framer-motion'
import { Badge } from "../../components/ui/badge"
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { BorderTrail } from '@/components/ui/border-trail'
import { cn } from '../../lib/utils'
import { UpgradePackageModal } from './packages/upgrade-package-modal'

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
    
    transition: {
      type: "spring",
      stiffness: 400
    }
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default function PackagesPage() {
  const navigate = useNavigate()
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const {
    availablePackages, 
    activePackages, 
    packagesLoading,
    purchasePackage
  } = usePackages()

  console.log('Packages Page Data:', {
    available: availablePackages,
    active: activePackages
  });

  const handlePackagePurchase = (pkg) => {
    navigate('/dashboard/payment', { state: { selectedPackage: pkg } });
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
    <div className="space-y-8 p-8 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      {/* Header Section with Animated Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-8">
      <BorderTrail
        style={{
          boxShadow:
            '0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
        }}
        size={100}
      />
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        <div className="relative">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary animate-text-gradient bg-300% mb-4">
            Subscription Packages
          </h1>
          <p className="text-xl text-muted-foreground/80 max-w-2xl">
            Start your journey to financial freedom with today
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Potential ROI</p>
              <p className="text-2xl font-bold text-green-500">Up to 300%</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Investors</p>
              <p className="text-2xl font-bold text-blue-500">1,000+</p>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Network className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Network Growth</p>
              <p className="text-2xl font-bold text-purple-500">Unlimited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Packages */}
      {activePackages && activePackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-card/50 to-card backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
                My Active Subscriptions
              </CardTitle>
              <CardDescription className="text-base">Your current subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-xl border bg-background/50">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-6 text-left align-middle font-medium">Package</th>
                        <th className="h-12 px-6 text-left align-middle font-medium">Amount</th>
                        <th className="h-12 px-6 text-left align-middle font-medium">Purchase Date</th>
                        <th className="h-12 px-6 text-left align-middle font-medium">Status</th>
                        <th className="h-12 px-6 text-left align-middle font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePackages?.map((pkg) => (
                        <tr key={pkg.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-6 align-middle font-medium">{pkg.package.name}</td>
                          <td className="p-6 align-middle">{formatCurrency(pkg.package.price)}</td>
                          <td className="p-6 align-middle">{new Date(pkg.createdAt).toLocaleDateString()}</td>
                          
                          <td className="p-6 align-middle">
                            <Badge variant="success" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                              {pkg.status}
                            </Badge>
                          </td>
                          <td className="p-6 align-middle">
                          <Button
                            variant="outline"
                            onClick={() => handleUpgrade(pkg)}
                            disabled={!availablePackages?.some(p => p.level > pkg.package.level)}
                          >
                            Upgrade
                          </Button>
                        </td>
                          {/* <td className="p-6 align-middle">Payment Method: {pkg.paymentMethod}</td> */}

                         
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Available Packages */}
      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {availablePackages.map((pkg, index) => {
          const benefits = typeof pkg.benefits === 'string' ? JSON.parse(pkg.benefits) : pkg.benefits || {};
          const isPremium = pkg.level === 4;
          
          // Check if this specific package is already purchased
          const isAlreadyPurchased = activePackages?.some(
            activePkg => activePkg.package.id === pkg.id && activePkg.status === 'ACTIVE'
          );
          
          return (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover="hover"
              className="relative group"
            >
              {isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 via-primary to-purple-500 text-white shadow-lg">
                    Premium
                  </span>
                </div>
              )}
              <Card className={cn(
                "h-full transition-all duration-500 overflow-hidden",
                isPremium 
                  ? "bg-gradient-to-br from-purple-500/10 via-primary/5 to-purple-500/10 hover:shadow-[0_0_40px_8px_rgba(124,58,237,0.1)] border-purple-500/20" 
                  : "hover:shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-background",
                isAlreadyPurchased && "opacity-50"
              )}>
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-xl">
                    <span>{pkg.name}</span>
                    {isPremium && <Star className="h-5 w-5 text-yellow-500 animate-pulse" />}
                  </CardTitle>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className={cn(
                      "text-4xl font-bold",
                      isPremium 
                        ? "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-primary to-purple-500" 
                        : "bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
                    )}>
                      {formatCurrency(pkg.price)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">One-time investment</p>
                  </div>
                  
                  <div className="space-y-3">
                    {benefits.features?.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 group/item">
                        <div className={cn(
                          "rounded-full p-1 transition-colors",
                          isPremium 
                            ? "bg-purple-500/10 group-hover/item:bg-purple-500/20" 
                            : "bg-primary/10 group-hover/item:bg-primary/20"
                        )}>
                          <Check className={cn(
                            "h-4 w-4",
                            isPremium ? "text-purple-500" : "text-primary"
                          )} />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-full p-2",
                        isPremium ? "bg-purple-500/10" : "bg-primary/10"
                      )}>
                        <TrendingUp className={cn(
                          "h-4 w-4",
                          isPremium ? "text-purple-500" : "text-primary"
                        )} />
                      </div>
                      <span className="text-sm">Level {pkg.level} Package</span>
                    </div>
                    {pkg.maxNodes && (
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "rounded-full p-2",
                          isPremium ? "bg-purple-500/10" : "bg-primary/10"
                        )}>
                          <Network className={cn(
                            "h-4 w-4",
                            isPremium ? "text-purple-500" : "text-primary"
                          )} />
                        </div>
                        <span className="text-sm">Up to {pkg.maxNodes} nodes</span>
                      </div>
                    )}
                    {pkg.duration && (
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "rounded-full p-2",
                          isPremium ? "bg-purple-500/10" : "bg-primary/10"
                        )}>
                          <Users className={cn(
                            "h-4 w-4",
                            isPremium ? "text-purple-500" : "text-primary"
                          )} />
                        </div>
                        <span className="text-sm">{pkg.duration} days validity</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className={cn(
                      "w-full h-12 transition-all font-medium text-white",
                      isPremium 
                        ? "bg-gradient-to-r from-purple-500 via-primary to-purple-500 hover:opacity-90" 
                        : "bg-gradient-to-r from-primary to-primary/80 hover:opacity-90",
                      "shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                    )}
                    onClick={() => handlePackagePurchase(pkg)}
                    disabled={isAlreadyPurchased}
                  >
                    {isAlreadyPurchased ? "Already Subscribed" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <UpgradePackageModal 
        open={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          setSelectedPackage(null)
        }}
        currentPackage={selectedPackage}
        availablePackages={availablePackages?.filter(pkg => 
          pkg.level > (selectedPackage?.package?.level || 0)
        )}
      />

      {/* Add custom styles to the head */}
      <style jsx global>{`
        @keyframes text-gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-text-gradient {
          animation: text-gradient 8s linear infinite;
        }
        
        .bg-300\% {
          background-size: 300%;
        }
        
        .bg-grid-white\/10 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 0h1v1H0zM19 0h1v1h-1zM0 19h1v1H0zM19 19h1v1h-1z'/%3E%3C/g%3E%3C/svg%3E");
          background-position: center;
          background-repeat: repeat;
        }
      `}</style>
    </div>
  );
}
