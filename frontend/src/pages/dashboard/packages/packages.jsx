import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star, TrendingUp, Users, Network } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { usePackages } from '@/hooks/payments/usePackages'
import { motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/auth/useAuth'
import {Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
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
    <div className="space-y-8 p-8 min-h-screen ">

      
      {/* Active Subscription Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Active Subscription</CardTitle>
          <CardDescription>View your current package details</CardDescription>
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
                  <h3 className="text-lg font-semibold">{userPackage.package.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Level {userPackage.package.level} Package
                  </p>
                </div>
                <Badge 
                  variant={userPackage.statusColor === 'red' ? 'destructive' : 
                          userPackage.statusColor === 'orange' ? 'warning' : 'success'}
                >
                  {userPackage.status}
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price</TableHead>
            
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{currency.symbol} {formatAmount(userPackage.package.price)}</TableCell>
              
              
                    <TableCell>{userPackage.status}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {userPackage.status !== 'EXPIRED' && (
                <div className="flex justify-end">
                  {/* <Button
                    variant="outline"
                    onClick={() => handleUpgrade(userPackage.package)}
                  >
                    Upgrade Package
                  </Button> */}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No active package. Purchase one below.</p>
            </div>
          )}
        </CardContent>
      </Card>

  

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
