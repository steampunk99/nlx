
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAllPrizeConfigs, usePrizeClaims } from "../../hooks/usePrizeAdmin"
import PrizeForm from "./PrizeForm"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../lib/axios"
import { Plus, Edit, Eye, Trash2, Clock, Users, DollarSign } from "lucide-react"

export default function AdminPrizes() {
  const { data: prizes, isLoading, error } = useAllPrizeConfigs()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPrize, setEditingPrize] = useState(null)
  const [deletePrizeId, setDeletePrizeId] = useState(null)
  const [claimsPrize, setClaimsPrize] = useState(null)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  
  const handleCreate = () => {
    setEditingPrize(null)
    setModalOpen(true)
  }



  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/prizes/config/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["allPrizeConfigs"])
    },
  })

  const handleDelete = (id) => {
    setDeletePrizeId(id)
  }

  const handleViewClaims = (prize) => {
    setClaimsPrize(prize)
  }

  const closeClaimsModal = () => setClaimsPrize(null)

  const claimsQuery = usePrizeClaims(claimsPrize?.id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="text-red-600 font-medium">Error loading prizes</div>
              <div className="text-red-500 text-sm mt-1">{error.message || error.toString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prize Management</h1>
            <p className="text-gray-600 mt-1">Manage your prize configurations and track claims</p>
          </div>
          <Button onClick={handleCreate} className="bg-black hover:bg-gray-800 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Prize
          </Button>
        </div>

        {/* Stats Cards */}
        {prizes && prizes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                  ⚡
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Prizes</p>
                    <p className="text-2xl font-bold text-gray-900">{prizes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Prizes</p>
                    <p className="text-2xl font-bold text-gray-900">{prizes.filter((p) => p.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                 🤑
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Winners</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {prizes.reduce((sum, p) => sum + (p.maxWinners || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Prizes Table */}
        <Card className="p-12 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl font-semibold text-gray-900">Prize Configurations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {prizes && prizes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Prize</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Schedule</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Winners</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prizes.map((prize, index) => (
                      <tr
                        key={prize.id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{prize.title}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900">{formatCurrency(prize.amount)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600">
                            <div>{prize.startTimeUTC}</div>
                            <div className="text-xs text-gray-500">{prize.durationMinutes} min</div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-gray-900">{prize.maxWinners}</div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={prize.isActive ? "default" : "secondary"}
                            className={
                              prize.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                            }
                          >
                            {prize.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewClaims(prize)}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(prize.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <DollarSign className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No prizes found</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first prize configuration.</p>
                <Button onClick={handleCreate} className="bg-black hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Prize
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prize Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {editingPrize ? "Edit Prize" : "Create Prize"}
              </DialogTitle>
            </DialogHeader>
            <PrizeForm
              initialData={editingPrize || undefined}
              onSuccess={() => setModalOpen(false)}
              mode={editingPrize ? "edit" : "create"}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={!!deletePrizeId} onOpenChange={() => setDeletePrizeId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-red-600">Delete Prize</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600">Are you sure you want to delete this prize? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeletePrizeId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMutation.mutate(deletePrizeId)
                  setDeletePrizeId(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Prize
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Claims Modal */}
        <Dialog open={!!claimsPrize} onOpenChange={closeClaimsModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Prize Claims: {claimsPrize?.title}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {claimsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : claimsQuery.error ? (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  {claimsQuery.error.message || claimsQuery.error.toString()}
                </div>
              ) : claimsQuery.data && claimsQuery.data.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Winner</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Claimed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimsQuery.data.map((claim, index) => {
                        const user = claim.node?.user
                        const name = user
                          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                          : claim.node?.userId || claim.nodeId
                        const amount = claim.amount ? Number(claim.amount).toLocaleString() : "-"
                        const claimedAt = claim.createdAt
                          ? new Date(claim.createdAt).toLocaleString(undefined, {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"
                        return (
                          <tr
                            key={claim.id}
                            className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                          >
                            <td className="py-3 px-4 text-sm font-mono text-gray-600">#{claim.id}</td>
                            <td className="py-3 px-4 font-medium text-gray-900">{name}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">UGX{amount}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{claimedAt}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Users className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                  <p className="text-gray-600">This prize hasn't been claimed by anyone yet.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
