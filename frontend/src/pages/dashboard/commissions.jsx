"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Removed all Lucide icon imports
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
import { useEarnings } from "@/hooks/dashboard/useDashboard"
import { toast } from "react-hot-toast"

// --- Inline SVGs for farm/cocoa theme ---
const CocoaPod = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="12" ry="16" fill="#8B5C2A" stroke="#5C3310" strokeWidth="2" />
    <ellipse cx="16" cy="16" rx="8" ry="12" fill="#D2A86A" stroke="#8B5C2A" strokeWidth="1.5" />
    <ellipse cx="16" cy="16" rx="4" ry="8" fill="#F7E1B5" stroke="#D2A86A" strokeWidth="1" />
  </svg>
)
const FarmCoin = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="14" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
    <ellipse cx="16" cy="16" rx="8" ry="8" fill="#FFF8DC" stroke="#FFD700" strokeWidth="1.5" />
    <path d="M12 16h8M16 12v8" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const FarmTrophy = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="22" width="12" height="4" rx="2" fill="#B8860B" />
    <ellipse cx="16" cy="14" rx="8" ry="8" fill="#FFD700" stroke="#B8860B" strokeWidth="2" />
    <path d="M8 14c0 6 16 6 16 0" stroke="#B8860B" strokeWidth="1.5" />
  </svg>
)
const FarmGift = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="20" height="12" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
    <rect x="12" y="8" width="8" height="6" rx="2" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
    <path d="M16 8v18" stroke="#B45309" strokeWidth="1.5" />
  </svg>
)
const FarmShield = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4l10 4v8c0 8-10 12-10 12S6 24 6 16V8l10-4z" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
  </svg>
)
const FarmUser = (props) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="6" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
    <ellipse cx="16" cy="24" rx="10" ry="6" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
  </svg>
)
const FarmArrowUp = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="#8B5C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
)
const FarmArrowDown = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="#8B5C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
)
const FarmCalendar = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="#8B5C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
)

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
  const {data:earnings} = useEarnings()

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

   const availableBalance = earnings?.availableBalance

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
              <FarmCoin className="w-5 h-5 text-black" />
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
    <div className="relative min-h-screen p-0 md:p-0 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] rounded-3xl overflow-hidden font-sans">
      {/* Farm field illustration background */}
      <svg className="absolute inset-0 w-full h-full object-cover pointer-events-none" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <ellipse cx="720" cy="320" rx="720" ry="80" fill="#b6d7b0" />
        <ellipse cx="200" cy="300" rx="180" ry="60" fill="#e6f2ef" />
        <ellipse cx="1240" cy="310" rx="200" ry="70" fill="#ffe066" />
        {/* Cocoa trees */}
        {[320, 1120, 600, 900].map((x, i) => (
          <g key={x}>
            <rect x={x} y={220} width="16" height="60" rx="7" fill="#8d6748"/>
            <ellipse cx={x+8} cy={220} rx="28" ry="18" fill="#4e7c3a"/>
            <ellipse cx={x+8} cy={220} rx="14" ry="9" fill="#7bb661"/>
            <ellipse cx={x+18} cy={240} rx="5" ry="10" fill="#c97c3a"/>
          </g>
        ))}
      </svg>
      {/* Floating cocoa pod mascot */}
      <div className="fixed top-8 right-8 z-40 hidden md:block animate-bounce-slow pointer-events-none">
        <CocoaPod className="w-20 h-28 drop-shadow-2xl" />
      </div>
      <div className="relative z-10 space-y-12 p-4 md:p-6 lg:p-10">
        {/* Level Up and Reward Notifications */}
        <LevelUpNotification />
        <RewardNotification />

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <span className="font-cursive text-3xl md:text-4xl text-[#4e3b1f] leading-tight drop-shadow-lg" style={{fontFamily:'Pacifico, cursive'}}>Commissions Quest</span>
            <p className="text-[#2c5f63] text-base md:text-lg font-medium mt-1">Track your earnings and rewards from your network</p>
          </div>
        </div>

        {/* Section Divider - Farm Fence */}
        <div className="flex items-center justify-center my-6">
          <svg width="320" height="32" viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[...Array(16)].map((_, i) => (
              <rect key={i} x={i*20} y="8" width="6" height="16" rx="2" fill="#ffe066" stroke="#b6d7b0" strokeWidth="1" />
            ))}
            <rect x="0" y="20" width="320" height="4" rx="2" fill="#b6d7b0" />
          </svg>
        </div>

        {/* Stats Grid - Game Style */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Available Balance */}
          <motion.div
            className="bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#ffe066]/40 rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-300 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.04 }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <CocoaPod className="w-12 h-12 drop-shadow-lg" />
            </div>
            <div className="p-8 pt-10 flex flex-col items-center">
              <p className="text-sm font-semibold text-[#2c5f63]">Available Balance</p>
              <p className="text-3xl font-extrabold text-green-700 mt-2">
           
                {currency.symbol} {formatAmount(availableBalance)}
              </p>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-500/60" />
          </motion.div>

          {/* Level Commissions */}
          <motion.div
            className="bg-gradient-to-br from-[#fffbe6]/80 to-[#ffe066]/80 border-2 border-[#ffe066]/40 rounded-3xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-300 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.04 }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <FarmShield className="w-12 h-12 drop-shadow-lg" />
            </div>
            <div className="p-8 pt-10 flex flex-col items-center">
              <p className="text-sm font-semibold text-[#2c5f63]">Commissions</p>
              <p className="text-3xl font-extrabold text-yellow-700 mt-2">
                {/* {formatCurrency(commissionStats?.levelCommissions || 0)} */}
                     {currency.symbol} {formatAmount(commissionStats?.levelCommissions || 0)}
              </p>
              <div className="flex items-center mt-2">
                <FarmArrowUp className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-700 font-bold">
                  +{formatCurrency(commissionStats?.thisMonthLevelCommissions || 0)}
                </span>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-yellow-500 to-yellow-500/60" />
          </motion.div>
        </div>

        {/* Section Divider - Animated Butterflies */}
        <div className="flex items-center justify-center my-8 gap-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`animate-float${i%2===0?'-reverse':''}`} width="32" height="32" viewBox="0 0 32 32" fill="none"><ellipse cx="16" cy="16" rx="10" ry="6" fill="#ffe066" opacity=".7"/><ellipse cx="10" cy="16" rx="4" ry="2" fill="#b6d7b0"/><ellipse cx="22" cy="16" rx="4" ry="2" fill="#b6d7b0"/></svg>
          ))}
        </div>

        {/* Commission History */}
        <motion.div
          className="bg-gradient-to-br from-[#b6d7b0]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0] rounded-2xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-8">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#4e3b1f] flex items-center drop-shadow-md">
                  <FarmCoin className="w-6 h-6 mr-2 text-yellow-500" />
                  Commission History
                </h2>
                <p className="text-base text-[#2c5f63]">
                  Showing {commissionHistory?.length || 0} of {totalCommissions || 0} transactions
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border-2 border-[#ffe066]/40 bg-[#fffbe6]/80 backdrop-blur-md shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-green-700 font-bold cursor-pointer" onClick={() => handleSort("description")}> 
                      <div className="flex items-center">
                        Description
                        {sortColumn === "description" &&
                          (sortDirection === "asc" ? (
                            <FarmArrowUp className="ml-1 h-3 w-3" />
                          ) : (
                            <FarmArrowDown className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="text-green-700 font-bold cursor-pointer" onClick={() => handleSort("amount")}> 
                      <div className="flex items-center">
                        Amount
                        {sortColumn === "amount" &&
                          (sortDirection === "asc" ? (
                            <FarmArrowUp className="ml-1 h-3 w-3" />
                          ) : (
                            <FarmArrowDown className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-green-700 font-bold">From</TableHead>
                    <TableHead className="hidden lg:table-cell text-green-700 font-bold">Package</TableHead>
                    <TableHead className="hidden sm:table-cell text-green-700 font-bold cursor-pointer" onClick={() => handleSort("date")}> 
                      <div className="flex items-center">
                        Date
                        {sortColumn === "date" &&
                          (sortDirection === "asc" ? (
                            <FarmArrowUp className="ml-1 h-3 w-3" />
                          ) : (
                            <FarmArrowDown className="ml-1 h-3 w-3" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className=" text-green-700 font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyLoading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
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
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-[#2c5f63]">
                        <div className="flex flex-col items-center gap-2">
                          <FarmCoin className="h-16 w-16 text-[#b6d7b0] mb-2 animate-bounce" />
                          <p className="text-2xl font-bold">No commission records found</p>
                          <p className="text-base">Complete quests to earn commissions</p>
                          <div className="flex gap-2 mt-2">
                            {[...Array(3)].map((_, i) => (
                              <svg key={i} className="animate-float" width="24" height="24" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="12" rx="7" ry="4" fill="#ffe066" opacity=".7"/><ellipse cx="7" cy="12" rx="2" ry="1" fill="#b6d7b0"/><ellipse cx="17" cy="12" rx="2" ry="1" fill="#b6d7b0"/></svg>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    commissionHistory?.map((commission) => {
                      const typeColor = getCommissionTypeColor(commission.type)
                      const statusColor = getCommissionStatusColor(commission.status)

                      return (
                        <TableRow key={commission.id} className="hover:bg-white/50 border-gray-700 transition-colors">
                          <TableCell className="font-medium ">
                            <div className="flex items-center">
                              <div
                                className={`w-8 h-8 rounded-full ${typeColor.bg} flex items-center justify-center mr-3`}
                              >
                                {commission.type === "DIRECT" && <FarmUser className="h-4 w-4 text-gray-600" />}
                                {commission.type === "MATCHING" && <FarmGift className="h-4 w-4 text-gray-600" />}
                                {commission.type === "LEVEL" && <FarmTrophy className="h-4 w-4 text-gray-600" />}
                              </div>
                              <div>
                                {commission.description}
                                <div className="block sm:hidden text-xs text-gray-600">
                                  {new Date(commission.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium font-mono text-green-600">
                          
                                 {currency.symbol} {formatAmount(commission?.amount)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">
                            {commission.sourceUser?.username || "System"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-gray-500">
                            <div className="flex items-center">
                              <FarmShield className="h-4 w-4 mr-1 text-yellow-600" />
                              {commission.package?.name || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-gray-500">
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
                    <FarmArrowDown className="h-4 w-4" />
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
                    <FarmArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      {/* Extra: subtle animated clouds */}
      <div className="pointer-events-none absolute top-0 left-0 w-full h-32 z-20 flex gap-8 opacity-60">
        {[...Array(3)].map((_, i) => (
          <svg key={i} className={`animate-cloud${i}`} width="120" height="40" viewBox="0 0 120 40" fill="none"><ellipse cx="40" cy="20" rx="40" ry="20" fill="#fffbe6"/><ellipse cx="80" cy="20" rx="30" ry="15" fill="#e6f2ef"/></svg>
        ))}
      </div>
      {/* Animations CSS */}
      <style>{`
        @keyframes float { 0%{transform:translateY(0);} 50%{transform:translateY(-10px);} 100%{transform:translateY(0);} }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-reverse { animation: float 3s ease-in-out infinite reverse; }
        @keyframes bounce-slow { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-20px);} }
        .animate-bounce-slow { animation: bounce-slow 4s infinite; }
        @keyframes cloud0 { 0%{transform:translateX(0);} 100%{transform:translateX(60vw);} }
        @keyframes cloud1 { 0%{transform:translateX(0);} 100%{transform:translateX(40vw);} }
        @keyframes cloud2 { 0%{transform:translateX(0);} 100%{transform:translateX(80vw);} }
        .animate-cloud0 { animation: cloud0 60s linear infinite; }
        .animate-cloud1 { animation: cloud1 80s linear infinite; }
        .animate-cloud2 { animation: cloud2 100s linear infinite; }
      `}</style>
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
