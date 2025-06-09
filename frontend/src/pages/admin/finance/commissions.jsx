import { useState, useEffect, useCallback } from 'react';
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Icon } from '@iconify/react';
import { useAdminCommissions } from '../../../hooks/admin/useAdminCommissions';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

const statusColors = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  PAID: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700"
};

const typeColors = {
  DIRECT: "bg-blue-50 text-blue-700",
  MATCHING: "bg-purple-50 text-purple-700",
  LEVEL: "bg-indigo-50 text-indigo-700"
};

export default function CommissionsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const {
    data,
    isLoading,
    isFetching,
    processCommission,
    isProcessing
  } = useAdminCommissions({
    page,
    limit: ITEMS_PER_PAGE,
    type: type || undefined,
    status: status || undefined,
    search: debouncedSearch || undefined
  });

  // Reset page when filters change
  useEffect(() => {
    if (debouncedSearch !== searchInput) {
      setPage(1);
    }
  }, [debouncedSearch, type, status]);

  // Track search loading state
  useEffect(() => {
    if (searchInput !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchInput, debouncedSearch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleProcess = (commission, action) => {
    processCommission({ commissionId: commission.id, action });
    setSelectedCommission(null);
  };

  if (!data && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const commissions = data?.commissions || [];
  const pagination = data?.pagination || {};

  // Calculate stats from commissions data
  const stats = commissions.reduce((acc, commission) => {
    const amount = parseFloat(commission.amount);
    
    // Total
    acc.totalAmount = (acc.totalAmount || 0) + amount;
    acc.totalCount = (acc.totalCount || 0) + 1;

    // By type
    if (commission.type === 'DIRECT') {
      acc.directAmount = (acc.directAmount || 0) + amount;
      acc.directCount = (acc.directCount || 0) + 1;
    } else if (commission.type === 'MATCHING') {
      acc.matchingAmount = (acc.matchingAmount || 0) + amount;
      acc.matchingCount = (acc.matchingCount || 0) + 1;
    }

    // By status
    if (commission.status === 'PENDING') {
      acc.pendingAmount = (acc.pendingAmount || 0) + amount;
      acc.pendingCount = (acc.pendingCount || 0) + 1;
    }

    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f2f2f2]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-sm text-gray-500">Track and manage referral commissions</p>
        </div>
        <Button className="gap-2">
          <Icon icon="ph:export-bold" className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Icon icon="ph:money-bold" className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalAmount || 0)}</div>
            <p className="text-xs text-gray-500">{stats?.totalCount || 0} commission(s)</p>
          </CardContent>
        </Card>
       
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Icon icon="ph:clock-bold" className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.pendingAmount || 0)}</div>
            <p className="text-xs text-gray-500">{stats?.pendingCount || 0} commission(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Icon 
            icon="ph:magnifying-glass-bold" 
            className={cn(
              "absolute left-2 top-2.5 h-4 w-4",
              isSearching ? "text-primary animate-pulse" : "text-muted-foreground"
            )} 
          />
          <Input
            placeholder="Search by ID, user, or referral..."
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
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="DIRECT">DIRECT</SelectItem>
            <SelectItem value="MATCHING">MATCHING</SelectItem>
            <SelectItem value="LEVEL">LEVEL</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
            <SelectItem value="PAID">PAID</SelectItem>
            <SelectItem value="FAILED">FAILED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>
            View and manage all referral commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {commissions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchInput ? (
                  <>
                    No commissions found matching "<span className="font-medium">{searchInput}</span>"
                    {status && " with selected status"}
                    {type && " and type"}
                  </>
                ) : status || type ? (
                  <>No commissions found with selected filters</>
                ) : (
                  "No commissions found"
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Referral</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.id}</TableCell>
                      <TableCell>
                        {commission.user?.firstName} {commission.user?.lastName}
                        <div className="text-sm text-muted-foreground">
                          {commission.user?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {commission.sourceUser?.firstName} {commission.sourceUser?.lastName}
                        <div className="text-sm text-muted-foreground">
                          {commission.sourceUser?.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          typeColors[commission.type]
                        )}>
                          {commission.type}
                        </span>
                      </TableCell>
                      <TableCell>{commission.package?.name || commission.level}</TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(commission.amount)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(commission.createdAt), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          statusColors[commission.status]
                        )}>
                          {commission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedCommission(commission)}
                          >
                            <Icon icon="ph:eye-bold" className="h-4 w-4" />
                          </Button>
                          {commission.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleProcess(commission, 'approve')}
                                disabled={isProcessing}
                              >
                                <Icon icon="ph:check-circle-bold" className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleProcess(commission, 'decline')}
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
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg border p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="hover:bg-gray-50"
                >
                  <Icon icon="ph:caret-left-bold" className="h-4 w-4" />
                </Button>
                <div className="px-4 text-sm">
                  Page {page} of {pagination.totalPages}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="hover:bg-gray-50"
                >
                  <Icon icon="ph:caret-right-bold" className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Details Dialog */}
      <Dialog open={!!selectedCommission} onOpenChange={() => setSelectedCommission(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commission Details</DialogTitle>
            <DialogDescription>
              View detailed information about this commission
            </DialogDescription>
          </DialogHeader>
          {selectedCommission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Commission ID</div>
                  <div>{selectedCommission.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Amount</div>
                  <div className="font-mono">{formatCurrency(selectedCommission.amount)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">User</div>
                  <div>{selectedCommission.user?.firstName} {selectedCommission.user?.lastName}</div>
                  <div className="text-sm text-muted-foreground">{selectedCommission.user?.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Referral</div>
                  <div>{selectedCommission.sourceUser?.firstName} {selectedCommission.sourceUser?.lastName}</div>
                  <div className="text-sm text-muted-foreground">{selectedCommission.sourceUser?.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Type</div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1",
                    typeColors[selectedCommission.type]
                  )}>
                    {selectedCommission.type}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium mt-1",
                    statusColors[selectedCommission.status]
                  )}>
                    {selectedCommission.status}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Package</div>
                  <div>{selectedCommission.package?.name || selectedCommission.level}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Created At</div>
                  <div>{format(new Date(selectedCommission.createdAt), 'PPpp')}</div>
                </div>
              </div>
              
              {selectedCommission.status === 'PENDING' && (
                <DialogFooter className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCommission(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleProcess(selectedCommission, 'decline')}
                    disabled={isProcessing}
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleProcess(selectedCommission, 'approve')}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
