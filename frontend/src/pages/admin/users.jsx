import { useState } from 'react'
import { useAdmin } from '../../hooks/useAdmin'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import { UserDetailsDialog } from '../../components/admin/UserDetailsDialog'
import { Search, Filter, Eye, Trash2, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UsersPage() {

  // to ugx
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(amount);
  }

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [deleteUserId, setDeleteUserId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)


  const { useUsers, useUpdateUserStatus, useDeleteUser } = useAdmin()
  const { data, isLoading, refetch } = useUsers()
  const updateStatus = useUpdateUserStatus()
  const deleteUser = useDeleteUser()

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateStatus.mutateAsync({ userId, newStatus })
      toast.success('User status updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update user status')
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and monitor user accounts
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="mt-4 sm:mt-0 inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between sm:flex-nowrap gap-4">
            <div className="relative flex-grow">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={handleSearch}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-transparent"
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flow-root">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Package</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Balance</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-10 text-center">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCcw className="h-5 w-5 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : data?.users?.length ? (
                  data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-gray-500 text-sm">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {user.node?.package?.package ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {user.node.package.package.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            No Package
                          </span>
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
                        <select
                          value={user.status || ''}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className={`rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(user.status)}`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(user.node?.availableBalance || 0)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteUserId(user.id)}
                            className="inline-flex items-center rounded-md bg-white px-2 py-1 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-sm text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
