import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from '@/hooks/admin/useAdmin';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from 'react-hot-toast';
import { 
  Search, 
  User, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Wallet,
  Crown,
  Sparkles
} from 'lucide-react';



export default function SuperAdminDepositPage() {
  const { useUsers, useDepositToUser, useAdminDeposits } = useAdmin();
  
  // State management - following the working users page pattern
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Fetch all users once (like the working users page)
  const { data: usersResponse = {}, isLoading: isLoadingUsers, refetch } = useUsers({
    limit: 1000, // Get all users
    status: '' // Don't filter by status initially
  });

  // Store users in state when they load
  useEffect(() => {
    if (usersResponse?.users) {
      setAllUsers(usersResponse.users);
    }
  }, [usersResponse]);

  // Client-side filtering (like the working users page)
  const filteredUsers = searchTerm && !selectedUser
    ? allUsers.filter(user => {
        if (!user) return false;
        const term = searchTerm.toLowerCase();
        const idStr = String(user.id || '').toLowerCase();
        const firstName = String(user.firstName || '').toLowerCase();
        const lastName = String(user.lastName || '').toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const username = String(user.username || '').toLowerCase();
        
        return (
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term) ||
          username.includes(term) ||
          idStr.includes(term)
        );
      }).slice(0, 8)
    : [];

  const { data: depositsData = [], refetch: refetchDeposits } = useAdminDeposits();
  const recentDeposits = depositsData.deposits || [];
  const depositMutation = useDepositToUser();

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.node?.status === 'ACTIVE').length,
    totalBalance: allUsers.reduce((sum, u) => sum + (u.node?.availableBalance || 0), 0),
    totalDeposits: recentDeposits.reduce((sum, d) => sum + Number(d.amount), 0)
  };

  const handleDeposit = async () => {
    if (!selectedUser || !amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please select a user and enter a valid amount');
      return;
    }

    try {
      await depositMutation.mutateAsync({ userId: selectedUser.id, amount: Number(amount) });
      toast.success(`Successfully deposited UGX${amount} to ${selectedUser.firstName} ${selectedUser.lastName}`,
        {
          icon: '👏',
          style: {
            borderRadius: '10px',
            background: '#3498db',
            color: '#fff',
          },
        });
      setAmount('');
      setSelectedUser(null);
      setSearchTerm('');
      setShowUserDropdown(false);
      refetchDeposits();
    } catch (error) {
      toast.error(error.message || 'Deposit failed',
        {
          icon: '👏',
          style: {
            borderRadius: '10px',
            background: '#3498db',
            color: '#fff',
          },
        });
    }
  };

  //green hex #3498db
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-cyan-800 bg-clip-text text-transparent">
                  Admin Deposits
                </h1>
                <p className="text-slate-600 text-lg">Manage user funds with ultimate control</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={refetch}
              disabled={isLoadingUsers}
              className="bg-white/80 hover:bg-white border-slate-200"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
              <p className="text-xs text-blue-600 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{stats.activeUsers}</div>
              <p className="text-xs text-emerald-600 mt-1">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalBalance)}</div>
              <p className="text-xs text-purple-600 mt-1">All user balances</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Total Deposits</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.totalDeposits)}</div>
              <p className="text-xs text-yellow-600 mt-1">All time deposits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Deposit Form - Enhanced */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-to-br from-white to-blue-50/30 border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                   💰
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quick Deposit</CardTitle>
                    <CardDescription className="text-blue-100">Add funds instantly to any user</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-6">
                  {/* User Search */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Select User
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Search by name, email, or username..."
                          className="pl-10 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                          value={selectedUser 
                            ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})` 
                            : searchTerm
                          }
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedUser(null);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                        />
                        {selectedUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(null);
                              setSearchTerm('');
                              setShowUserDropdown(false);
                            }}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      {showUserDropdown && searchTerm && !selectedUser && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-80 overflow-auto">
                          {isLoadingUsers ? (
                            <div className="p-6 text-center">
                              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-500" />
                              <p className="text-slate-600">Searching users...</p>
                            </div>
                          ) : filteredUsers.length > 0 ? (
                            <div className="p-2">
                              {filteredUsers.map((user) => (
                                <div
                                  key={user.id}
                                  className="p-3 hover:bg-blue-50 cursor-pointer rounded-lg flex items-center gap-3 transition-colors"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserDropdown(false);
                                  }}
                                >
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-2 border-blue-200">
                                    <span className="text-sm font-semibold text-blue-700">
                                      {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold text-slate-900 truncate">
                                        {user.firstName} {user.lastName}
                                      </p>
                                      {user.role === 'ADMIN' && (
                                        <Crown className="h-3 w-3 text-yellow-500" />
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant={user.node?.status === 'ACTIVE' ? 'success' : 'secondary'} className="text-xs">
                                        {user.node?.status || 'INACTIVE'}
                                      </Badge>
                                      <span className="text-xs text-slate-500">
                                        Balance: {formatCurrency(user.node?.availableBalance || 0)}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-slate-500">
                              <User className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                              <p>No matching users found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected User Display */}
                  {selectedUser && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-2 border-blue-300">
                          <span className="text-lg font-bold text-blue-700">
                            {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900">
                              {selectedUser.firstName} {selectedUser.lastName}
                            </h4>
                            {selectedUser.role === 'ADMIN' && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{selectedUser.email}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Current: {formatCurrency(selectedUser.node?.availableBalance || 0)}
                            </Badge>
                            {selectedUser.node?.package?.package && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedUser.node.package.package.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  {selectedUser && (
                    <div className="space-y-3">
                      
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500 font-medium">💰</span>
                        <Input
                          type="number"
                          min="1"
                          step="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          className="pl-8 text-lg font-semibold bg-white border-slate-200 focus:border-green-400 focus:ring-green-400"
                          autoFocus
                        />
                      </div>
                      {amount && Number(amount) > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>New Balance:</strong> {formatCurrency((selectedUser.node?.availableBalance || 0) + Number(amount))}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg disabled:opacity-50"
                    disabled={depositMutation.isLoading || !selectedUser || !amount || Number(amount) <= 0}
                    size="lg"
                    onClick={handleDeposit}
                  >
                    {depositMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Deposit...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Deposit {amount ? `UGX${amount}` : 'Funds'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deposits */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-800">Recent Deposits</CardTitle>
                      <CardDescription>Track all admin deposit transactions</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetchDeposits}
                    className="bg-white/80 hover:bg-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {recentDeposits.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                        <DollarSign className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">No deposits yet</h3>
                      <p className="text-slate-500">Deposit transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentDeposits.map((deposit) => (
                        <div
                          key={deposit.id}
                          className="p-4 bg-gradient-to-r from-white to-slate-50/50 rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center border-2 border-emerald-200">
                                <span className="text-sm font-bold text-emerald-700">
                                  {deposit.node?.user?.firstName?.[0]}{deposit.node?.user?.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-slate-900">
                                    {deposit.node?.user?.firstName} {deposit.node?.user?.lastName}
                                  </h4>
                                  {deposit.node?.user?.role === 'ADMIN' && (
                                    <Crown className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600">{deposit.node?.user?.email}</p>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(deposit.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-emerald-600">
                                +{formatCurrency(Number(deposit.amount))}
                              </div>
                              <Badge variant="success" className="mt-1">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {deposit.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}