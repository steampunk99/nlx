import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useForm } from "react-hook-form"
import { api } from "../../lib/axios"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useCommissions } from "../../hooks/useCommissions"

export default function WithdrawalsPage() {
  const { user } = useAuth()
  const { commissions, commissionStats } = useCommissions()
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  //format currency to UGX
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Calculate available balance
  const availableBalance = commissionStats?.totalCommissions || 0

  // Fetch withdrawal history
  const { data: withdrawalsData } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const response = await api.get('/withdrawals')
      return response.data.data
    }
  })

  // Withdrawal mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/withdrawals', data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Withdrawal request submitted successfully')
      queryClient.invalidateQueries(['withdrawals'])
      reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal')
    }
  })

  const onSubmit = async (data) => {
    withdrawalMutation.mutate({
      amount: parseFloat(data.amount),
      phone: data.phone
    })
  }

  const withdrawalHistory = withdrawalsData?.withdrawals?.map((withdrawal) => ({
    id: withdrawal.id,
    amount: withdrawal.amount,
    phone: withdrawal.details?.phone,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt
  })) || []

  // Calculate total withdrawn amount
  const totalWithdrawn = withdrawalHistory.reduce((total, withdrawal) => 
    total + (withdrawal.status === 'COMPLETED' ? Number(withdrawal.amount) : 0)
  , 0)

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'text-green-600 bg-green-100'
      case 'PENDING' || 'PROCESSING':
        return 'text-yellow-600 bg-yellow-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Amount available for withdrawal</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Withdrawn</CardTitle>
            <CardDescription>Lifetime withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalWithdrawn)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            Withdraw your earnings to your mobile money account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label>Amount (UGX)</label>
              <Input
                type="number"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1000, message: 'Minimum withdrawal is UGX 1,000' },
                  max: { value: availableBalance, message: 'Amount exceeds available balance' }
                })}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <span className="text-sm text-red-500">{errors.amount.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <label>Phone Number</label>
              <Input
                type="tel"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^07\d{8}$/,
                    message: 'Please enter a valid Ugandan phone number (e.g., 0701234567)'
                  }
                })}
                placeholder="Enter phone number (e.g., 0701234567)"
              />
              {errors.phone && (
                <span className="text-sm text-red-500">{errors.phone.message}</span>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={withdrawalMutation.isPending || availableBalance < 1000}
              className="w-full"
            >
              {withdrawalMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawalHistory.length > 0 ? (
              withdrawalHistory.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No withdrawal history</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
