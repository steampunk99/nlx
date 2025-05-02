import { useState } from "react"; // Keep for potential future use
import { useForm } from "react-hook-form";
import { api } from "../../lib/axios"; // Assuming axios instance is configured
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/auth/useAuth"; // Assuming needed for context
import { useCommissions } from "../../hooks/dashboard/useCommissions";
import { useCountry } from "@/hooks/config/useCountry"; // Ensure this hook provides { currency, formatAmount }
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
  const availableBalance = commissionStats?.totalCommissions ?? 0;

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
    <div className="relative min-h-screen space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950 text-gray-100 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,black,transparent)] opacity-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Content Area */}
      <motion.div
        className="relative z-10 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Stats Section */}
        <motion.section variants={itemVariants} className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Available Balance Card */}
           <div className="relative bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10 group transition-all hover:border-cyan-500/60">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 shadow-inner">
                  <Wallet className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cyan-300/80">Available Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-100 tracking-tight">
                    {currency.symbol} {formatAmount(availableBalance)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Withdrawn Card */}
           <div className="relative bg-black/40 backdrop-blur-md border border-purple-500/30 rounded-xl overflow-hidden shadow-lg shadow-purple-500/10 group transition-all hover:border-purple-500/60">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/40 shadow-inner">
                  <ArrowDown className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-300/80">Total Withdrawn</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-100 tracking-tight">
                    {currency.symbol} {formatAmount(totalWithdrawn)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Withdrawal Form Section */}
        <motion.section variants={itemVariants}>
           <div className="relative bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-xl shadow-cyan-500/10 p-5 sm:p-6 lg:p-8 group transition-all hover:border-cyan-500/60">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
             <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5 flex items-center gap-3">
                <Send className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                Request Withdrawal
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Amount Input */}
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-cyan-300/80 flex items-center gap-1">
                    Amount <span className="text-cyan-500">({currency.symbol})</span>
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-400/50">
                        {currency.symbol}
                     </div>
                     <input
                        id="amount"
                        type="number"
                        step="any"
                        {...register("amount", {
                          required: "Amount is required",
                          valueAsNumber: true,
                          min: { value: 1000, message: `Minimum withdrawal is ${currency.symbol} 1,000` },
                          max: { value: availableBalance, message: `Insufficient balance (Available: ${formatAmount(availableBalance)})` },
                          validate: value => value <= availableBalance || `Amount exceeds available balance`
                        })}
                        className="w-full pl-8 pr-4 py-2.5 bg-black/50 border border-cyan-500/40 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition duration-200"
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
                  <label htmlFor="phone" className="text-sm font-medium text-cyan-300/80">
                    Mobile Money Number (Uganda)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^07\d{8}$/, // Ugandan format (07XXXXXXXX)
                        message: "Enter a valid Ugandan number (e.g., 0701234567)",
                      },
                    })}
                    className="w-full px-4 py-2.5 bg-black/50 border border-cyan-500/40 rounded-lg text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition duration-200"
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
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50 focus:ring-cyan-400
                    ${withdrawalMutation.isPending || availableBalance < 1000
                      ? 'bg-gray-600 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/40 transform hover:-translate-y-0.5'
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
           <div className="relative bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10 p-5 sm:p-6 lg:p-8 group transition-all hover:border-cyan-500/60">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-5 flex items-center gap-3">
                <DatabaseZap className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                Transaction History
              </h2>

              {isLoadingHistory ? (
                 <div className="text-center py-10 text-cyan-300/70 flex items-center justify-center gap-2">
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
                        className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${statusConfig.border} ${statusConfig.bg} shadow-md ${statusConfig.glow} transition-all hover:bg-gray-800/40`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden"> {/* Added overflow-hidden */}
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${statusConfig.bg} border ${statusConfig.border}`}>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0"> {/* Added flex-1 min-w-0 */}
                            <p className="font-semibold text-gray-100 truncate"> {/* Added truncate */}
                              {currency.symbol} {formatAmount(withdrawal.amount)}
                            </p>
                            <p className="text-xs text-gray-400 truncate"> {/* Added truncate */}
                              {/* Using current location Kampala for default locale formatting - adjust 'en-UG' if needed */}
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
                <p className="text-center py-10 text-cyan-300/70">
                  No withdrawal history yet.
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

// Add this to your global CSS if you don't have a utility for it:
/*
.animation-delay-2000 {
  animation-delay: 2s;
}
*/