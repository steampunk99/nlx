import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../lib/axios";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/auth/useAuth";
import { useCommissions } from "../../hooks/dashboard/useCommissions";
import { useCountry } from "@/hooks/config/useCountry"; 
import { useEarnings } from "@/hooks/dashboard/useDashboard";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  History,
  Smartphone,
  DollarSign,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
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

  const {data: earnings} = useEarnings()
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { currency, formatAmount } = useCountry(); // Assuming provides { symbol: 'UGX', name: 'Ugandan Shilling' }, formatAmount function


  const [recentWithdrawalTxId, setRecentWithdrawalTxId] = useState(null);
  // --- Add state for expanded withdrawal ---
  const [expandedId, setExpandedId] = useState(null);

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
    refetchInterval: 15000, // Poll every 15 seconds for updated withdrawal status
  });

  // Withdrawal mutation using React Query
  const withdrawalMutation = useMutation({
    mutationFn: async (data) => {
      if (!data || typeof data !== 'object') throw new Error('Invalid form data');
      const payload = {
        ...data,
        amount: parseFloat(data.amount)
      };
      const response = await api.post("/withdrawals", payload);
      console.log("withdrawing");
      return response.data;
    },
    onSuccess: (data) => {
      // Use trans_id for polling (from backend response)
      setRecentWithdrawalTxId(data?.withdrawal?.trans_id || data?.trans_id);
      setModal({ open: true, status: "pending", message: data?.message || "Withdrawal request submitted!" });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      reset();
    },
    onError: (error) => {
      let errorMessage = "Failed to process withdrawal. Please try again.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setModal({ open: true, status: "error", message: errorMessage });
      // toast.error(errorMessage);
      console.error("Withdrawal error:", error);
    },
  });



  // **MODIFICATION 2: Access the '.withdrawals' array *within* the fetched object**
  const withdrawalHistory = withdrawalsApiResponse?.withdrawals?.map((withdrawal) => ({
    id: withdrawal.id,
    amount: withdrawal.amount,
    status: withdrawal.status?.toUpperCase() || 'UNKNOWN', // Normalize status
    createdAt: withdrawal.createdAt,
    phone: withdrawal.details?.phone || withdrawal.phone,
    failureReason: withdrawal.failureReason,
    details: withdrawal.details || {},
  })) || []; // Default to empty array if withdrawalsApiResponse or .withdrawals is missing/null

 
  // Calculate total withdrawn amount (only successful ones)
  const totalWithdrawn = withdrawalHistory.reduce(
    (total, withdrawal) =>
      total + (withdrawal.status === "SUCCESSFUL" ? Number(withdrawal.amount) : 0),
    0
  );

  // --- Additional State ---
  const [showBalance, setShowBalance] = useState(true);
  const [modal, setModal] = useState({ open: false, status: null, message: "" });

  // --- UI Configuration ---
  const getStatusConfig = (status) => {
    switch (status) {
      case "SUCCESSFUL":
        return { 
          icon: CheckCircle, 
          color: "text-emerald-600", 
          bg: "bg-emerald-50", 
          border: "border-emerald-200", 
          text: "Completed",
          dotColor: "bg-emerald-500"
        };
      case "PENDING":
      case "PROCESSING":
        return { 
          icon: Clock, 
          color: "text-amber-600", 
          bg: "bg-amber-50", 
          border: "border-amber-200", 
          text: "Processing",
          dotColor: "bg-amber-500"
        };
      case "FAILED":
        return { 
          icon: XCircle, 
          color: "text-red-600", 
          bg: "bg-red-50", 
          border: "border-red-200", 
          text: "Failed",
          dotColor: "bg-red-500"
        };
      default:
        return { 
          icon: AlertTriangle, 
          color: "text-gray-600", 
          bg: "bg-gray-50", 
          border: "border-gray-200", 
          text: status || "Unknown",
          dotColor: "bg-gray-500"
        };
    }
  };

  // --- Event Handlers ---

  const onSubmit = (data) => {
    withdrawalMutation.mutate(data);
  };

  // --- Check if user has already made a successful withdrawal today ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const hasWithdrawnToday = withdrawalHistory.some(w => {
    if (w.status !== 'SUCCESSFUL') return false;
    const created = new Date(w.createdAt);
    created.setHours(0, 0, 0, 0);
    return created.getTime() === today.getTime();
  });

  // --- Render ---

  return (
    <div className="min-h-screen  p-4 md:p-6 lg:p-8">
      {/* Modern geometric background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            💳 Withdrawals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your funds with secure and instant withdrawals
          </p>
        </motion.div>
        {/* Stats Cards */}
        <motion.section variants={itemVariants} className="grid gap-6 md:grid-cols-3 mb-12">
          {/* Available Balance Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {showBalance ? <Eye className="w-4 h-4 text-gray-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                {showBalance ? `${currency.symbol} ${formatAmount(availableBalance)}` : '••••••'}
              </p>
            </div>
          </div>

          {/* Total Withdrawn Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Withdrawn</p>
              <p className="text-3xl font-bold text-gray-900">
                {currency.symbol} {formatAmount(totalWithdrawn)}
              </p>
            </div>
          </div>

        </motion.section>
        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Withdrawal Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Request Withdrawal</h2>
              </div>

              {hasWithdrawnToday && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 font-medium">Daily limit reached</p>
                    <p className="text-amber-700 text-sm">You can only make one successful withdrawal per day. Please try again tomorrow.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="any"
                      {...register("amount", {
                        required: "Amount is required",
                        valueAsNumber: true,
                        min: { value: 10000, message: `Minimum withdrawal is ${currency.symbol} 10,000` },
                        max: { value: availableBalance, message: `Insufficient balance (Available: ${formatAmount(availableBalance)})` },
                        validate: value => value <= availableBalance || `Amount exceeds available balance`
                      })}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70"
                      placeholder="Enter amount"
                      disabled={hasWithdrawnToday}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum: {currency.symbol} 10,000 • Maximum: {currency.symbol} {formatAmount(availableBalance)}
                  </p>
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} /> {errors.amount?.message?.toString() || 'Invalid amount'}
                    </p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone className="h-5 w-5 text-gray-400" />
                    </div>
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
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/70"
                      placeholder="0701234567"
                      disabled={hasWithdrawnToday}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your Uganda mobile money number
                  </p>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} /> {errors.phone?.message?.toString() || 'Invalid phone number'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={withdrawalMutation.isPending || availableBalance < 10000 || hasWithdrawnToday}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                    ${withdrawalMutation.isPending || availableBalance < 10000 || hasWithdrawnToday
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {withdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-5 h-5" />
                      Request Withdrawal
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
          {/* Transaction History */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
              </div>

              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <span className="ml-3 text-gray-600">Loading transactions...</span>
                </div>
              ) : withdrawalHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {withdrawalHistory.map((withdrawal) => {
                    const statusConfig = getStatusConfig(withdrawal.status);
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedId === withdrawal.id;
                    const isPending = withdrawal.status === "PENDING" || withdrawal.status === "PROCESSING";
                    
                    return (
                      <motion.div
                        key={withdrawal.id}
                        variants={itemVariants}
                        className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${statusConfig.border} ${statusConfig.bg}`}
                        onClick={() => setExpandedId(expandedId === withdrawal.id ? null : withdrawal.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={`w-3 h-3 rounded-full ${statusConfig.dotColor}`}></div>
                              {isPending && (
                                <div className={`absolute inset-0 w-3 h-3 rounded-full ${statusConfig.dotColor} animate-ping`}></div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {currency.symbol} {formatAmount(withdrawal.amount)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                              {statusConfig.text}
                            </span>
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700">Amount:</span>
                                  <span className="ml-2 text-gray-900">{currency.symbol} {formatAmount(withdrawal.amount)}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700">Status:</span>
                                  <span className="ml-2 text-gray-900">{withdrawal.status}</span>
                                </div>
                                {withdrawal.phone && (
                                  <div>
                                    <span className="font-medium text-gray-700">Phone:</span>
                                    <span className="ml-2 text-gray-900">{withdrawal.phone}</span>
                                  </div>
                                )}
                                {withdrawal.details?.trans_id && (
                                  <div>
                                    <span className="font-medium text-gray-700">Transaction ID:</span>
                                    <span className="ml-2 text-gray-900 font-mono text-xs">{withdrawal.details.trans_id}</span>
                                  </div>
                                )}
                                {withdrawal.details?.fee !== undefined && (
                                  <div>
                                    <span className="font-medium text-gray-700">Fee:</span>
                                    <span className="ml-2 text-gray-900">{currency.symbol} {formatAmount(withdrawal.details.fee)}</span>
                                  </div>
                                )}
                                {withdrawal.failureReason && (
                                  <div className="md:col-span-2">
                                    <span className="font-medium text-red-700">Failure Reason:</span>
                                    <span className="ml-2 text-red-600">{withdrawal.failureReason}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <History className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-medium">No transactions yet</p>
                  <p className="text-gray-500 text-sm mt-1">Your withdrawal history will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      {/* Success/Error Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setModal({ open: false, status: null, message: "" })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  modal.status === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {modal.status === 'error' ? (
                    <XCircle className="w-8 h-8 text-red-600" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {modal.status === 'error' ? 'Withdrawal Failed' : 'Withdrawal Submitted'}
                </h3>
                <p className="text-gray-600 mb-6">{modal.message}</p>
                <button
                  onClick={() => setModal({ open: false, status: null, message: "" })}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}