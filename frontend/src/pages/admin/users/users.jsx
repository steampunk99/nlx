import { useState, useEffect } from 'react'
import { useAdmin } from '../../../hooks/admin/useAdmin'
import { CreateUserDialog } from '../../../components/admin/CreateUserDialog'
import { UserDetailsDialog } from '../../../components/admin/UserDetailsDialog'
import { formatDistanceToNow } from 'date-fns'
import ReactCountryFlag from 'react-country-flag'
import { toast } from 'react-hot-toast'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  RefreshCcw, 
  Users as UsersIcon,
  UserPlus,
  Activity,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'


const COUNTRY_NAMES = {
  'UG': 'Uganda',
  'US': 'United States',
  'GB': 'United Kingdom',
  // ... add more as needed
}

const UsersPage = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleteUserId, setDeleteUserId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 50,
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const { useUsers, useDeleteUser, useVerifyUser } = useAdmin()
  const { data, isLoading, refetch } = useUsers(queryParams)
  const deleteUser = useDeleteUser()
  const verifyUser = useVerifyUser()

  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryParams(prev => ({
        ...prev,
        search: search,
        status: statusFilter
      }))
    }, 300) // Debounce search

    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleStatusFilter = (value) => {
    setStatusFilter(value)
  }

  const handleDelete = async () => {
    if (!deleteUserId) return
    try {
      await deleteUser.mutateAsync(deleteUserId)
      setDeleteUserId(null)
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const handleVerify = async (userId) => {
    try {
      await verifyUser.mutateAsync(userId)
      toast.success('User verified successfully')
      refetch() // Refresh the user list
    } catch (error) {
      toast.error(error.message || 'Failed to verify user')
    }
  }

  const filteredUsers = data?.users?.filter(user => {
    const matchesSearch = search.toLowerCase() === '' || 
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const stats = {
    total: data?.users?.length || 0,
    active: data?.users?.filter(u => u.status === 'ACTIVE').length || 0,
    inactive: data?.users?.filter(u => u.status === 'INACTIVE').length || 0,
    recent: data?.users?.filter(u => {
      const joinDate = new Date(u.createdAt)
      const now = new Date()
      return Math.abs(now - joinDate) / (1000 * 60 * 60 * 24) <= 7
    }).length || 0
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="h-full space-y-6 p-6 pb-16 bg-gradient-to-b from-slate-50 to-slate-100/50">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Users</h1>
            <p className="text-sm text-slate-600">
              Manage and monitor user accounts across the platform
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => refetch()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <CreateUserDialog />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <p className="text-xs text-blue-600">
                Registered accounts
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{stats.active}</div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                <p className="text-xs text-emerald-600">
                  Currently active
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Inactive Users</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{stats.inactive}</div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-amber-500 mr-2" />
                <p className="text-xs text-amber-600">
                  Pending activation
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-cyan-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">New Users</CardTitle>
              <UserPlus className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-900">{stats.recent}</div>
              <p className="text-xs text-cyan-600">
                Joined in last 7 days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/80 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-800">User Management</CardTitle>
          <CardDescription className="text-slate-600">
            View and manage all registered users in the system
          </CardDescription>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-8 w-[300px] bg-white/50 focus:bg-white transition-colors border-slate-200"
                />
              </div>
             
            </div>
         
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/50">
                  <tr className="transition-colors hover:bg-slate-100/50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">User</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">Package</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">Balance</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-slate-600">Location</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center">
                        <div className="inline-flex items-center gap-2">
                          <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers?.length ? (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b transition-colors hover:bg-slate-100/50"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border border-blue-200">
                              <span className="text-sm font-medium text-blue-700">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-slate-600">{user.email}</div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger className="text-xs text-blue-600">
                                    Joined {formatDistanceToNow(new Date(user.createdAt))} ago
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
                                    <p className="text-blue-700">{new Date(user.createdAt).toLocaleString()}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {user.node?.package?.package ? (
                            <Badge variant="secondary" className="font-medium">
                              {user.node.package.package.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">No Package</Badge>
                          )}
                        </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === 'ADMIN' 
                            ? 'bg-purple-50 text-purple-700 ring-purple-700/10' 
                            : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                        } ring-1 ring-inset`}>
                          {user.role}
                        </span>
                        </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          user.node?.status === "ACTIVE" 
                            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                            : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
                        }`}>
                          {user.node?.status || 'INACTIVE'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className="font-medium text-gray-900">
                            {formatCurrency(user.node?.availableBalance || 0)}
                          </span>
                        </td>
                        <td className="p-4">
                          {user.country && (
                            <div className="flex items-center gap-2">
                              <ReactCountryFlag
                                countryCode={user.country}
                                svg
                                className="rounded-sm"
                              />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span className="text-sm">{user.country}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{COUNTRY_NAMES[user.country] || user.country}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedUserId(user.id)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Details</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {user.node?.status !== 'ACTIVE' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleVerify(user.id)}
                                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                      disabled={verifyUser.isLoading}
                                    >
                                      {verifyUser.isLoading ? (
                                        <RefreshCcw className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <ShieldCheck className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Verify User</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteUserId(user.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete User</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedUserId && (
        <UserDetailsDialog
          open={!!selectedUserId}
          onOpenChange={() => setSelectedUserId(null)}
          userId={selectedUserId}
        />
      )}
    </div>
  )
}

export default UsersPage