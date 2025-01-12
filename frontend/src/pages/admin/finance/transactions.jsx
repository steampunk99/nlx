import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
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
import { Loader2, CheckCircle, XCircle, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
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

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const { data, isLoading, isFetching } = useAdmin().useTransactions({
    page,
    limit: ITEMS_PER_PAGE,
    status: status === 'All' ? undefined : status,
    search: debouncedSearch || undefined
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(transactions.reduce((acc, tx) => acc + Number(tx.amount), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-white">
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

      {/* Transactions Table */}
      <div className="rounded-md border bg-white relative min-h-[400px]">
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
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Transaction ID</TableHead>
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Created At</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="font-mono">{tx.transactionId}</TableCell>
                  <TableCell>
                    {tx.node.user.firstName} {tx.node.user.lastName}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {tx.node.user.email}
                    </span>
                  </TableCell>
                  <TableCell>{formatCurrency(tx.amount)}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell>
                    {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    {tx.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700"
                          onClick={() => {
                            setSelectedTx(tx);
                            setAction('approve');
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setSelectedTx(tx);
                            setAction('decline');
                          }}
                        >
                          <XCircle className="h-4 w-4" />
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
