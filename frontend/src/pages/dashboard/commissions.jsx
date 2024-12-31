import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../components/ui/table"
import { 
  DollarSign, 
  Users, 
  ArrowUpRight,
  Download, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useCommissions } from '../../hooks/useCommissions';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";

export default function CommissionsPage() {
  // State management
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [itemsPerPage] = useState(10);

  // Format currency in UGX
  const formatCurrency = (amount) => {
    const value = Number(amount);
    if (!amount || isNaN(value)) return "UGX 0";
    return `UGX ${value.toLocaleString('en-US')}`;
  };

  // Hook integration with filters
  const { 
    commissionStats, 
    commissionHistory,
    totalCommissions,
    totalPages,
    statsLoading, 
    historyLoading,
    isWithdrawing,
    refetchHistory,
    withdraw 
  } = useCommissions({
    page: currentPage,
    limit: itemsPerPage,
    type: filterType || null,
    status: filterStatus || null
  });

  const handleWithdrawal = () => {
    if (!withdrawalAmount || isNaN(withdrawalAmount)) {
      return;
    }
    
    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0) {
      return;
    }

    withdraw({ amount });
    setWithdrawalModalOpen(false);
    setWithdrawalAmount('');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'type') setFilterType(value);
    if (type === 'status') setFilterStatus(value);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const renderCommissionStats = () => {
    if (statsLoading) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(item => (
            <Skeleton key={item} className="h-40 w-full" />
          ))}
        </div>
      );
    }

    const statsData = [
      {
        title: "Available Commissions",
        value: formatCurrency(commissionStats?.totalCommissions || 0),
        description: "Lifetime earnings from commissions",
        icon: DollarSign,
        color: "text-green-500"
      },
    
      // {
      //   title: "Level Commissions",
      //   value: formatCurrency(commissionStats?.levelCommissions || 0),
      //   description: "Earnings from level bonuses",
      //   icon: DollarSign,
      //   color: "text-green-500"
      // }
    ];

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="rounded-full p-2 bg-muted">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCommissionHistory = () => {
    if (historyLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(item => (
            <Skeleton key={item} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Commission History</CardTitle>
            <CardDescription>
              Showing {commissionHistory.length} of {totalCommissions} transactions
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <Select 
              value={filterType} 
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="DIRECT">Direct</SelectItem>
                <SelectItem value="MATCHING">Matching</SelectItem>
                <SelectItem value="LEVEL">Level</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filterStatus} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSED">Processed</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchHistory()}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>ID</TableHead> */}
                <TableHead>Description</TableHead>
                <TableHead >Amount</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No commission records found
                  </TableCell>
                </TableRow>
              ) : (
                commissionHistory.map((commission) => (
                  <TableRow key={commission.id}>
                   
                    {/* <TableCell>{commission.id}</TableCell> */}
                    <TableCell>{commission.description}</TableCell>
                    <TableCell className="font-medium font-mono font-bold">
                      {formatCurrency(commission.amount)}
                    </TableCell>
                    <TableCell>{commission.sourceUser?.username || 'System'}</TableCell>
                    <TableCell>{commission.package.name}</TableCell>
                    <TableCell>{new Date(commission.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        className="bg-green-400"
                      >
                        {commission.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Commissions</h1>
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedPeriod} 
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
      
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {renderCommissionStats()}
      {renderCommissionHistory()}

    </div>
  );
}
