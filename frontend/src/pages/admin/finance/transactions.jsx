import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/admin/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Download,
  Filter,
  ArrowUpDown,
  Info,
  CreditCard,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isSameMonth } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedTx, setSelectedTx] = useState(null);
  const [action, setAction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Copy transaction ID with visual feedback
  const copyTransactionId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const { data, isLoading, isFetching } = useAdmin().useTransactions({
    page,
    limit: ITEMS_PER_PAGE,
    status: status === 'All' ? undefined : status,
    search: debouncedSearch || undefined,
  });

  // Reset page when search or status changes
  useEffect(() => {
    if (debouncedSearch !== searchInput) {
      setPage(1);
    }
  }, [debouncedSearch, status]);

  // Track search loading state
  useEffect(() => {
    if (searchInput !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchInput, debouncedSearch]);

  const { approveTransaction, declineTransaction } = useAdmin();

  if (!data && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const transactions = data?.transactions || [];
  const pagination = data?.pagination || {};
  const pendingCount = data?.pendingCount || 0;

  const handleAction = () => {
    if (action === 'approve') {
      approveTransaction(selectedTx.transactionId);
    } else {
      declineTransaction(selectedTx.transactionId);
    }
    setSelectedTx(null);
    setAction(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'bg-blue-50 text-blue-700 border-blue-100',
      SUCCESSFUL: 'bg-green-50 text-green-700 border-green-100',
      FAILED: 'bg-red-50 text-red-700 border-red-100'
    };
    return (
      <span className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center",
        variants[status]
      )}>
        {status === 'PENDING' && <span className="w-1 h-1 bg-blue-500 rounded-full mr-1.5" />}
        {status === 'SUCCESSFUL' && <span className="w-1 h-1 bg-green-500 rounded-full mr-1.5" />}
        {status === 'FAILED' && <span className="w-1 h-1 bg-red-500 rounded-full mr-1.5" />}
        {status}
      </span>
    );
  };

  const handleSort = (key) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'amount') {
      aVal = Number(aVal);
      bVal = Number(bVal);
    }
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'User', 'Email', 'Amount', 'Type', 'Status', 'Created At'];
    const csvData = sortedTransactions.map(tx => [
      tx.transactionId,
      `${tx.node.user.firstName} ${tx.node.user.lastName}`,
      tx.node.user.email,
      tx.amount,
      tx.type,
      tx.status,
      format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#f2f2f2] mx-auto py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
          onClick={() => {/* Navigate to all transactions */}}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{pagination.total || 0}</div>
            <p className="text-xs text-blue-700 mt-1">
              +{transactions.filter(tx => {
                const date = new Date(tx.createdAt);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length} today
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
          onClick={() => {/* Navigate to pending transactions */}}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{pendingCount}</div>
            <p className="text-xs text-amber-700 mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
          onClick={() => {/* Navigate to successful transactions */}}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(transactions.reduce((acc, tx) => acc + Number(tx.amount), 0))}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Across {transactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer border-none shadow-md"
          onClick={() => {/* Navigate to transaction analytics */}}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Success Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {transactions.length ? Math.round((transactions.filter(tx => tx.status === 'SUCCESSFUL').length / transactions.length) * 100) : 0}%
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {transactions.filter(tx => tx.status === 'SUCCESSFUL').length} successful
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-2 top-2.5 h-4 w-4",
            isSearching ? "animate-pulse text-primary" : "text-muted-foreground"
          )} />
          <Input
            placeholder="Search by ID, email, or name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={cn(
              "pl-8 bg-white",
              isSearching && "pr-8"
            )}
          />
          {isSearching && (
            <div className="absolute right-2 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              Status Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUCCESSFUL">Successful</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          variant="secondary"
          onClick={exportToCSV}
          className="w-[180px] bg-green-500 hover:bg-green-600 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border bg-white relative min-h-[400px] shadow-sm">
        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchInput ? (
              <>
                No transactions found matching "<span className="font-medium">{searchInput}</span>"
                {status !== 'All' && " with selected status"}
              </>
            ) : status !== 'All' ? (
              <>No {status.toLowerCase()} transactions found</>
            ) : (
              "No transactions found"
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('transactionId')}
                    className="hover:bg-transparent"
                  >
                    Transaction ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('amount')}
                    className="hover:bg-transparent"
                  >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('type')}
                    className="hover:bg-transparent"
                  >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('status')}
                    className="hover:bg-transparent"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('createdAt')}
                    className="hover:bg-transparent"
                  >
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((tx) => (
                <TableRow 
                  key={tx.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      className="font-mono text-sm px-2 py-1 h-auto hover:bg-blue-50 group-hover:bg-blue-50/50"
                      onClick={() => copyTransactionId(tx.transactionId)}
                    >
                      {copiedId === tx.transactionId ? (
                        <span className="text-green-600">Copied!</span>
                      ) : (
                        tx.transactionId
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {tx.node.user.firstName} {tx.node.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.node.user.email}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(tx.amount)}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(new Date(tx.createdAt), 'PPPP')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.status === 'PENDING' && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 h-8 px-3 rounded-full"
                          onClick={() => {
                            setSelectedTx(tx);
                            setAction('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 h-8 px-3 rounded-full"
                          onClick={() => {
                            setSelectedTx(tx);
                            setAction('decline');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent className="bg-white shadow-sm rounded-lg border">
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="hover:bg-gray-50"
                />
              </PaginationItem>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => setPage(i + 1)}
                    isActive={page === i + 1}
                    className={cn(
                      "hover:bg-gray-50",
                      page === i + 1 && "bg-primary/10 hover:bg-primary/20"
                    )}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="hover:bg-gray-50"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {action} this transaction?
              <div className="mt-4 space-y-2">
                <p><strong>Transaction ID:</strong> {selectedTx?.transactionId}</p>
                <p><strong>Amount:</strong> {selectedTx && formatCurrency(selectedTx.amount)}</p>
                <p><strong>User:</strong> {selectedTx?.node.user.email}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTx(null)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              className={cn(
                action === 'approve' && "bg-green-600 hover:bg-green-700",
              )}
            >
              {action === 'approve' ? 'Approve' : 'Decline'} Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
