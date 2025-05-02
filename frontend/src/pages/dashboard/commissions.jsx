"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign,
  Users,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Coins,
  Trophy,
  Wallet,
  ArrowUp,
  ArrowDown,
  Calendar,
  Sparkles,
  Gift,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCommissions } from "../../hooks/dashboard/useCommissions"
import { useCountry } from "../../hooks/config/useCountry"
import { toast } from "react-hot-toast"

export default function CommissionsPage() {
  // State management
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false)

  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [itemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [playerLevel, setPlayerLevel] = useState(3)
  const [playerXP, setPlayerXP] = useState(450)
  const [playerGold, setPlayerGold] = useState(1500)
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")

  const { country, currency, formatAmount } = useCountry()

  // Hook integration with filters
  const {
    commissionStats,
    commissions,
    commissionHistory,
    totalCommissions,
    totalPages,
    statsLoading,
    historyLoading,
    isWithdrawing,
    refetchHistory,
    withdraw,
  } = useCommissions({
    page: currentPage,
    limit: itemsPerPage,
    type: filterType || null,
    status: filterStatus || null,
  })

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    const value = Number(amount)
    if (!amount || isNaN(value)) return `${currency?.symbol || "USh"} 0`
    return `${currency?.symbol || "USh"} ${value.toLocaleString("en-US")}`
  }

 

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle filter change
  const handleFilterChange = (type, value) => {
    if (type === "type") setFilterType(value)
    if (type === "status") setFilterStatus(value)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle sort change
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  // Gain XP and level up if needed
  const gainXP = (amount) => {
    const newXP = playerXP + amount
    const xpToLevelUp = playerLevel * 500 // XP required to level up

    if (newXP >= xpToLevelUp) {
      // Level up
      setPlayerLevel(playerLevel + 1)
      setPlayerXP(newXP - xpToLevelUp)
      setShowLevelUp(true)

      // Hide level up notification after 3 seconds
      setTimeout(() => {
        setShowLevelUp(false)
      }, 3000)
    } else {
      setPlayerXP(newXP)
    }
  }

  // Get commission type badge color
  const getCommissionTypeColor = (type) => {
    switch (type) {
      case "DIRECT":
        return {
          bg: "bg-blue-500",
          text: "text-white",
        }
      case "MATCHING":
        return {
          bg: "bg-purple-500",
          text: "text-white",
        }
      case "LEVEL":
        return {
          bg: "bg-amber-500",
          text: "text-white",
        }
      default:
        return {
          bg: "bg-gray-500",
          text: "text-white",
        }
    }
  }

  // Get commission status badge color
  const getCommissionStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-yellow-500",
          text: "text-black",
        }
      case "PROCESSED":
        return {
          bg: "bg-green-500",
          text: "text-white",
        }
      case "WITHDRAWN":
        return {
          bg: "bg-blue-500",
          text: "text-white",
        }
      default:
        return {
          bg: "bg-gray-500",
          text: "text-white",
        }
    }
  }

  // Render level up notification
  const LevelUpNotification = () => (
    <AnimatePresence>
      {showLevelUp && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500 rounded-lg p-4 shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-white font-bold">Level Up!</p>
              <p className="text-sm text-gray-300">You've reached level {playerLevel}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Render reward notification
  const RewardNotification = () => (
    <AnimatePresence>
      {showReward && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-gradient-to-r from-amber-900 to-yellow-900 border border-yellow-500 rounded-lg p-4 shadow-lg"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-white font-bold">Withdrawal Successful!</p>
              <p className="text-sm text-gray-300">You've earned 50 XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-12 w-3/4 bg-gray-800 rounded-lg"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
        <div className="h-[500px] bg-gray-800 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Level Up and Reward Notifications */}
      <LevelUpNotification />
      <RewardNotification />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Commissions Quest</h1>
          <p className="text-gray-400">Track your earnings and rewards from your network</p>
        </div>
      
      </div>

      {/* Stats Grid - Game Style */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Available Balance */}
        <motion.div
          className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-900/30">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Available Balance</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(commissionStats?.totalCommissions || 0)}
                </p>
                <div className="flex items-center mt-1">
                  
                 
                </div>
              </div>
            </div>
        
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-500/60" />
        </motion.div>

     

        {/* Level Commissions */}
        <motion.div
          className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-900/30">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Commissions</p>
                <p className="text-2xl font-bold text-purple-500">
                  {formatCurrency(commissionStats?.levelCommissions || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUp className="w-3 h-3 text-purple-500 mr-1" />
                  <span className="text-xs text-purple-500">
                    +{formatCurrency(commissionStats?.thisMonthLevelCommissions || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-3 text-sm">
             
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-500/60" />
        </motion.div>
      </div>

      {/* Commission History */}
      <motion.div
        className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-500" />
                Commission History
              </h2>
              <p className="text-sm text-gray-400">
                Showing {commissionHistory?.length || 0} of {totalCommissions || 0} transactions
              </p>
            </div>
           
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="hover:bg-gray-900/80 border-gray-700">
                  <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort("description")}>
                    <div className="flex items-center">
                      Description
                      {sortColumn === "description" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="ml-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="ml-1 h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort("amount")}>
                    <div className="flex items-center">
                      Amount
                      {sortColumn === "amount" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="ml-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="ml-1 h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-gray-300">From</TableHead>
                  <TableHead className="hidden lg:table-cell text-gray-300">Package</TableHead>
                  <TableHead
                    className="hidden sm:table-cell text-gray-300 cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortColumn === "date" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="ml-1 h-3 w-3" />
                        ) : (
                          <ArrowDown className="ml-1 h-3 w-3" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  [...Array(5)].map((_, index) => (
                    <TableRow key={index} className="hover:bg-gray-800/50 border-gray-700">
                      <TableCell>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : commissionHistory?.length === 0 ? (
                  <TableRow className="hover:bg-gray-800/50 border-gray-700">
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      <div className="flex flex-col items-center">
                        <Coins className="h-12 w-12 text-gray-600 mb-2" />
                        <p className="text-lg font-medium">No commission records found</p>
                        <p className="text-sm">Complete quests to earn commissions</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  commissionHistory?.map((commission) => {
                    const typeColor = getCommissionTypeColor(commission.type)
                    const statusColor = getCommissionStatusColor(commission.status)

                    return (
                      <TableRow key={commission.id} className="hover:bg-gray-800/50 border-gray-700 transition-colors">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full ${typeColor.bg} flex items-center justify-center mr-3`}
                            >
                              {commission.type === "DIRECT" && <Users className="h-4 w-4 text-white" />}
                              {commission.type === "MATCHING" && <Gift className="h-4 w-4 text-white" />}
                              {commission.type === "LEVEL" && <Trophy className="h-4 w-4 text-white" />}
                            </div>
                            <div>
                              {commission.description}
                              <div className="block sm:hidden text-xs text-gray-400">
                                {new Date(commission.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium font-mono text-green-400">
                          {formatCurrency(commission.amount)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-gray-300">
                          {commission.sourceUser?.username || "System"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-300">
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-yellow-500" />
                            {commission.package?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-400">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColor.bg} ${statusColor.text} whitespace-nowrap`}>
                            {commission.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 py-4 mt-4">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700 disabled:bg-gray-900/50 disabled:text-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const pageNumber =
                    currentPage <= 3
                      ? index + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + index
                        : currentPage - 2 + index

                  if (pageNumber > 0 && pageNumber <= totalPages) {
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={
                          currentPage === pageNumber
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-900 border-gray-700 text-white hover:bg-gray-700"
                        }
                      >
                        {pageNumber}
                      </Button>
                    )
                  }
                  return null
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-900 border-gray-700 text-white hover:bg-gray-700 disabled:bg-gray-900/50 disabled:text-gray-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>


    </div>
  )
}

// Crown icon component
function Crown(props) {
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
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  )
}
