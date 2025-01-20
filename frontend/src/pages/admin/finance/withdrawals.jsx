import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useAdminWithdrawals } from "@/hooks/admin/useAdminWithdrawals"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  SUCCESSFUL: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  REJECTED: "bg-gray-50 text-gray-700"
};

export default function AdminWithdrawalsPage() {
  // State
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get withdrawals data
  const {
    withdrawals,
    stats,
    pagination,
    isLoading,
    isFetching,
    processWithdrawal,
    isProcessing
  } = useAdminWithdrawals({
    page,
    limit: ITEMS_PER_PAGE,
    status: status || undefined,
    search: searchInput || undefined
  });

  const formatCurrency = (amount) => {
    // Parse the amount as a float to handle decimal strings
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return '0';
    
    return new Intl.NumberFormat('en-UG', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };

  const handleProcess = (withdrawal, action, remarks) => {
    processWithdrawal({ withdrawalId: withdrawal.id, action, remarks });
    setSelectedWithdrawal(null);
  };

  // Calculate total stats
  const totalAmount = (
    parseFloat(stats.successful?.amount || 0) +
    parseFloat(stats.pending?.amount || 0) +
    parseFloat(stats.processing?.amount || 0)
  );

  const pendingAmount = (
    parseFloat(stats.pending?.amount || 0) +
    parseFloat(stats.processing?.amount || 0)
  );

  const failedAmount = (
    parseFloat(stats.failed?.amount || 0) +
    parseFloat(stats.rejected?.amount || 0)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Withdrawal Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage withdrawal requests</p>
        </div>
        <Button className="gap-2 bg-gray-900 hover:bg-gray-800">
          <Icon icon="ph:export-bold" className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gray-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
            <Icon icon="ph:money-bold" className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">UGX</span>
              <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {(stats.successful?.count || 0) + (stats.pending?.count || 0) + (stats.processing?.count || 0)} total withdrawal(s)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
            <Icon icon="ph:clock-bold" className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-yellow-900">UGX</span>
              <span className="text-3xl font-extrabold tracking-tight text-yellow-900">
                {formatCurrency(pendingAmount)}
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {(stats.pending?.count || 0) + (stats.processing?.count || 0)} pending request(s)
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Successful</CardTitle>
            <Icon icon="ph:check-circle-bold" className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-green-900">UGX</span>
              <span className="text-3xl font-extrabold tracking-tight text-green-900">
                {formatCurrency(stats.successful?.amount || 0)}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {stats.successful?.count || 0} successful
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Failed/Rejected</CardTitle>
            <Icon icon="ph:x-circle-bold" className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-red-900">UGX</span>
              <span className="text-3xl font-extrabold tracking-tight text-red-900">
                {formatCurrency(failedAmount)}
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {(stats.failed?.count || 0) + (stats.rejected?.count || 0)} failed/rejected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by transaction ID, name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full md:max-w-xs bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-300"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-gray-50 border-gray-200">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SUCCESSFUL">Successful</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-gray-600">ID</TableHead>
              <TableHead className="font-medium text-gray-600">User</TableHead>
              <TableHead className="font-medium text-gray-600">Amount</TableHead>
              <TableHead className="font-medium text-gray-600">Phone</TableHead>
              <TableHead className="font-medium text-gray-600">Status</TableHead>
              <TableHead className="font-medium text-gray-600">Created At</TableHead>
              <TableHead className="font-medium text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id}>
                <TableCell className="font-medium">{withdrawal.id}</TableCell>
                <TableCell>
                  {withdrawal.user?.firstName} {withdrawal.user?.lastName}
                  <div className="text-sm text-muted-foreground">
                    {withdrawal.user?.email}
                  </div>
                </TableCell>
                <TableCell className="font-mono">
                  {formatCurrency(withdrawal.amount)}
                </TableCell>
                <TableCell>{withdrawal.phone}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    statusColors[withdrawal.status]
                  )}>
                    {withdrawal.status}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(withdrawal.createdAt), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                    >
                      <Icon icon="ph:eye-bold" className="h-4 w-4" />
                    </Button>
                    {withdrawal.status === 'PENDING' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleProcess(withdrawal, 'approve', 'Approved by admin')}
                          disabled={isProcessing}
                        >
                          <Icon icon="ph:check-circle-bold" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleProcess(withdrawal, 'reject', 'Rejected by admin')}
                          disabled={isProcessing}
                        >
                          <Icon icon="ph:x-circle-bold" className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(page * ITEMS_PER_PAGE, pagination.totalItems)} of {pagination.totalItems} withdrawals
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Withdrawal Details Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            <DialogDescription>
              Review withdrawal request details
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Transaction ID</div>
                  <div>{selectedWithdrawal.transactionId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Amount</div>
                  <div>{formatCurrency(selectedWithdrawal.amount)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      statusColors[selectedWithdrawal.status]
                    )}>
                      {selectedWithdrawal.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Method</div>
                  <div>{selectedWithdrawal.method}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Phone</div>
                  <div>{selectedWithdrawal.phone}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Created At</div>
                  <div>{format(new Date(selectedWithdrawal.createdAt), 'MMM d, yyyy HH:mm')}</div>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Processed At</div>
                    <div>{format(new Date(selectedWithdrawal.processedAt), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                )}
                {selectedWithdrawal.completedAt && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Completed At</div>
                    <div>{format(new Date(selectedWithdrawal.completedAt), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">User Details</div>
                <div className="text-sm">
                  <div>{selectedWithdrawal.user.firstName} {selectedWithdrawal.user.lastName}</div>
                  <div className="text-gray-500">{selectedWithdrawal.user.email}</div>
                </div>
              </div>
              {selectedWithdrawal.status === 'PENDING' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleProcess(selectedWithdrawal, 'reject', 'Rejected by admin')}
                    disabled={isProcessing}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleProcess(selectedWithdrawal, 'approve', 'Approved by admin')}
                    disabled={isProcessing}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
