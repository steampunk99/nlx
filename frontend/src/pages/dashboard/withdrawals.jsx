import { useState } from "react"; // Keep for potential future use
import { useForm } from "react-hook-form";
import { api } from "../../lib/axios"; // Assuming axios instance is configured
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/auth/useAuth"; // Assuming needed for context
import { useCommissions } from "../../hooks/dashboard/useCommissions";
import { useCountry } from "@/hooks/config/useCountry"; 
import { useEarnings } from "@/hooks/dashboard/useDashboard";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Zap, // Using Zap for loading indicator
  DatabaseZap, // Icon for history
  Send, // Icon for request form
  Loader2 // Added for history loading state
} from "lucide-react";

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function WithdrawalsPage() {
  // Hooks
  const { user } = useAuth(); // Keep if needed elsewhere or for future use
  const { commissionStats } = useCommissions();
  const { data:earnings } = useEarnings()
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { currency, formatAmount } = useCountry(); // Assuming provides { symbol: 'UGX', name: 'Ugandan Shilling' }, formatAmount function

  // --- State and Data Fetching ---

  // Calculate available balance (using optional chaining and nullish coalescing)
 const availableBalance = earnings?.availableBalance

  // Fetch withdrawal history using React Query
  // **MODIFICATION 1: Fetch the container object, not the array directly**
  const { data: withdrawalsApiResponse, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      try {
        const response = await api.get("/withdrawals");
        // Log for debugging (optional)
        console.log("API Response Data for /withdrawals:", JSON.stringify(response.data, null, 2));

        // Return the object containing withdrawals, matching the old working code's expectation.
        // Use nullish coalescing for a safe default if response.data or response.data.data is missing.
        return response.data?.data ?? null; // Return null if the expected object isn't there

      } catch (error) {
        console.error("Failed to fetch withdrawal history:", error);
        toast.error("Could not load withdrawal history.");
        return null; // Return null on error, handled by optional chaining later
      }
    },
     staleTime: 1000 * 60 * 2, // Optional: Cache data for 2 minutes
     refetchOnWindowFocus: true, // Optional: Refetch when window regains focus
  });

  // Withdrawal mutation using React Query
  const withdrawalMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount)
      };
      const response = await api.post("/withdrawals", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Withdrawal request submitted!");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      reset();
    },
    onError: (error) => {
      let errorMessage = "Failed to process withdrawal. Please try again.";
      if (error.isAxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error("Withdrawal error:", error);
    },
  });

  // --- Data Processing ---

  // **MODIFICATION 2: Access the '.withdrawals' array *within* the fetched object**
  const withdrawalHistory = withdrawalsApiResponse?.withdrawals?.map((withdrawal) => ({
     id: withdrawal.id,
     amount: withdrawal.amount,
     status: withdrawal.status?.toUpperCase() || 'UNKNOWN', // Normalize status
     createdAt: withdrawal.createdAt
  })) || []; // Default to empty array if withdrawalsApiResponse or .withdrawals is missing/null

  // Calculate total withdrawn amount (only successful ones)
  const totalWithdrawn = withdrawalHistory.reduce(
    (total, withdrawal) =>
      total + (withdrawal.status === "SUCCESSFUL" ? Number(withdrawal.amount) : 0),
    0
  );

  // --- UI Configuration ---

  const getStatusConfig = (status) => {
    switch (status) {
      case "SUCCESSFUL":
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-900/30", border: "border-emerald-500/30", glow: "shadow-emerald-500/20", text: "Successful" };
      case "PENDING":
      case "PROCESSING":
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-900/30", border: "border-amber-500/30", glow: "shadow-amber-500/20", text: "Pending" };
      case "FAILED":
        return { icon: XCircle, color: "text-rose-400", bg: "bg-rose-900/30", border: "border-rose-500/30", glow: "shadow-rose-500/20", text: "Failed" };
      default:
        return { icon: AlertCircle, color: "text-gray-400", bg: "bg-gray-800/30", border: "border-gray-600/30", glow: "shadow-gray-500/10", text: status || "Unknown" };
    }
  };

  // --- Event Handlers ---

  const onSubmit = (data) => {
    withdrawalMutation.mutate(data);
  };

  // --- Render ---

  return (
    <div className="relative min-h-screen space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#f8f8f5] via-[#e6f2ef] to-[#b6d7b0] text-[#4e3b1f] overflow-hidden font-sans">
      {/* Immersive Cocoa Farm World Background */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg className="absolute left-0 top-0 w-40 h-40 opacity-10" viewBox="0 0 32 32"><ellipse cx="16" cy="16" rx="13" ry="8" fill="#C97C3A"/><ellipse cx="16" cy="16" rx="9" ry="5" fill="#8D6748"/><ellipse cx="16" cy="16" rx="5" ry="2.5" fill="#FFE066"/><path d="M16 8C18 10 20 14 16 24" stroke="#8D6748" strokeWidth="1.5"/><path d="M16 8C14 10 12 14 16 24" stroke="#8D6748" strokeWidth="1.5"/></svg>
        <svg className="absolute right-0 bottom-0 w-48 h-48 opacity-10" viewBox="0 0 32 32"><rect x="6" y="14" width="20" height="12" rx="2" fill="#FFE066" stroke="#C97C3A" strokeWidth="2"/><rect x="13" y="20" width="6" height="6" rx="1" fill="#B6D7B0"/><path d="M4 16L16 6l12 10" stroke="#B6D7B0" strokeWidth="2"/></svg>
        <svg className="absolute left-1/2 -translate-x-1/2 bottom-10 w-32 h-32 opacity-5" viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="10" ry="5" fill="#B6D7B0" stroke="#8D6748" strokeWidth="2"/><ellipse cx="16" cy="20" rx="5" ry="2.5" fill="#FFE066" stroke="#8D6748" strokeWidth="1.5"/><rect x="14" y="8" width="4" height="10" rx="2" fill="#C97C3A"/></svg>
        {/* Animated clouds */}
        <svg className="absolute top-10 left-1/4 w-32 h-12 animate-cloud-move" viewBox="0 0 100 40"><ellipse cx="30" cy="20" rx="30" ry="12" fill="#fffbe6"/><ellipse cx="60" cy="20" rx="20" ry="10" fill="#e6f2ef"/></svg>
        <svg className="absolute top-20 right-1/4 w-40 h-16 animate-cloud-move2" viewBox="0 0 120 50"><ellipse cx="50" cy="25" rx="40" ry="15" fill="#fffbe6"/><ellipse cx="90" cy="25" rx="25" ry="12" fill="#e6f2ef"/></svg>
      </div>
      <motion.div
        className="relative z-10 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Section */}
        <motion.section variants={itemVariants} className="grid gap-6 md:grid-cols-2">
          {/* Available Balance Card */}
          <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-2xl overflow-visible shadow-2xl flex flex-col items-center px-6 pt-12 pb-8 min-w-[160px] max-w-xs mx-auto group hover:scale-105 transition-transform">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-[#8D6748]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-cursive text-[#A67C52]">Available Balance</p>
              <p className="text-2xl font-extrabold text-[#4e3b1f] mt-1">{formatAmount(availableBalance)}</p>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#8d6748] rounded-b-xl shadow-inner border-t-4 border-[#b6d7b0]/30" />
          </div>
          {/* Total Withdrawn Card */}
          <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#ffe066]/80 border-2 border-[#ffe066]/40 rounded-2xl overflow-visible shadow-2xl flex flex-col items-center px-6 pt-12 pb-8 min-w-[160px] max-w-xs mx-auto group hover:scale-105 transition-transform">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                <ArrowDown className="w-8 h-8 text-[#C97C3A]" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-cursive text-[#A67C52]">Total Withdrawn</p>
              <p className="text-2xl font-extrabold text-[#4e3b1f] mt-1">{formatAmount(totalWithdrawn)}</p>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#8d6748] rounded-b-xl shadow-inner border-t-4 border-[#b6d7b0]/30" />
          </div>
        </motion.section>
        {/* Withdrawal Form Section */}
        <motion.section variants={itemVariants}>
          <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-3xl overflow-visible shadow-2xl p-8 pt-12 group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                <Send className="w-8 h-8 text-[#8D6748]" />
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#C97C3A] font-cursive mb-5 flex items-center gap-3">
                Request Withdrawal
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-[#A67C52] flex items-center gap-1">
                    Amount <span className="text-[#C97C3A]">({currency.symbol.replace('US', '')})</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#C97C3A]/50">
                      {currency.symbol.replace('US', '')}
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="any"
                      {...register("amount", {
                        required: "Amount is required",
                        valueAsNumber: true,
                        min: { value: 1000, message: `Minimum withdrawal is ${currency.symbol.replace('US', '')} 1,000` },
                        max: { value: availableBalance, message: `Insufficient balance (Available: ${formatAmount(availableBalance)})` },
                        validate: value => value <= availableBalance || `Amount exceeds available balance`
                      })}
                      className="w-full pl-8 pr-4 py-2.5 bg-white/60 border border-[#b6d7b0]/40 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/40 focus:outline-none focus:border-[#b6d7b0]/80 focus:ring-1 focus:ring-[#b6d7b0]/50 transition duration-200"
                      placeholder="Enter amount"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-rose-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.amount?.message?.toString() || 'Invalid amount'}
                    </p>
                  )}
                </div>
                {/* Phone Input */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-[#A67C52]">
                    Mobile Money Number (Uganda)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^07\d{8}$/,
                        message: "Enter a valid Ugandan number (e.g., 0701234567)",
                      },
                    })}
                    className="w-full px-4 py-2.5 bg-white/60 border border-[#b6d7b0]/40 rounded-lg text-[#4e3b1f] placeholder-[#A67C52]/40 focus:outline-none focus:border-[#b6d7b0]/80 focus:ring-1 focus:ring-[#b6d7b0]/50 transition duration-200"
                    placeholder="e.g., 0701234567"
                  />
                  {errors.phone && (
                    <p className="text-sm text-rose-400 flex items-center gap-1">
                      <AlertCircle size={14} /> {errors.phone?.message?.toString() || 'Invalid phone number'}
                    </p>
                  )}
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={withdrawalMutation.isPending || availableBalance < 1000}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#b6d7b0]/50 focus:ring-[#C97C3A]
                    ${withdrawalMutation.isPending || availableBalance < 1000
                      ? 'bg-gray-600 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-[#b6d7b0] to-[#ffe066] hover:from-[#b6d7b0]/80 hover:to-[#ffe066]/80 shadow-lg hover:shadow-[#b6d7b0]/40 transform hover:-translate-y-0.5'
                    }`}
                >
                  {withdrawalMutation.isPending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Request Withdrawal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.section>
        {/* Withdrawal History Section */}
        <motion.section variants={itemVariants}>
          <div className="relative bg-gradient-to-br from-[#fffbe6]/80 to-[#e6f2ef]/80 border-2 border-[#b6d7b0]/40 rounded-3xl overflow-visible shadow-2xl p-8 pt-12 group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-br from-[#ffe066] to-[#b6d7b0] rounded-full p-3 shadow-lg border-2 border-[#8d6748]/30 flex items-center justify-center">
                <DatabaseZap className="w-8 h-8 text-[#8D6748]" />
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[#C97C3A] font-cursive mb-5 flex items-center gap-3">
                Transaction History
              </h2>
              {isLoadingHistory ? (
                <div className="text-center py-10 text-[#A67C52]/70 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading History...
                </div>
              ) : withdrawalHistory.length > 0 ? (
                <motion.ul
                  className="space-y-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {withdrawalHistory.map((withdrawal) => {
                    const statusConfig = getStatusConfig(withdrawal.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.li
                        key={withdrawal.id}
                        variants={itemVariants}
                        className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${statusConfig.border} ${statusConfig.bg} shadow-md ${statusConfig.glow} transition-all hover:bg-[#e6f2ef]/40`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${statusConfig.bg} border ${statusConfig.border}`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#4e3b1f] truncate">
                              {currency.symbol} {formatAmount(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-[#A67C52] truncate">
                              {new Date(withdrawal.createdAt).toLocaleDateString('en-UG', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                          {statusConfig.text}
                        </span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : (
                <p className="text-center py-10 text-[#A67C52]/70">
                  No withdrawal history yet.
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </motion.div>
      {/* Animations CSS */}
      <style>{`
        @keyframes cloud-move { 0%{transform:translateX(0);} 100%{transform:translateX(60vw);} }
        @keyframes cloud-move2 { 0%{transform:translateX(0);} 100%{transform:translateX(40vw);} }
        .animate-cloud-move { animation: cloud-move 60s linear infinite; }
        .animate-cloud-move2 { animation: cloud-move2 80s linear infinite; }
      `}</style>
    </div>
  );
}

// Add this to your global CSS if you don't have a utility for it:
/*
.animation-delay-2000 {
  animation-delay: 2s;
}
*/