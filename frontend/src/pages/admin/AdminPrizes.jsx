import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAllPrizeConfigs, usePrizeClaims } from '../../hooks/usePrizeAdmin';
import PrizeForm from './PrizeForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function AdminPrizes() {
  const { data: prizes, isLoading, error } = useAllPrizeConfigs();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [deletePrizeId, setDeletePrizeId] = useState(null);
  const [claimsPrize, setClaimsPrize] = useState(null); // Prize object for which to show claims modal

  const handleCreate = () => {
    setEditingPrize(null);
    setModalOpen(true);
  };
  const handleEdit = (prize) => {
    setEditingPrize(prize);
    setModalOpen(true);
  };
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/prizes/config/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allPrizeConfigs']);
    }
  });
  
  const handleDelete = (id) => {
    setDeletePrizeId(id);
  };

  // Claims modal logic
  const handleViewClaims = (prize) => {
    setClaimsPrize(prize);
  };
  const closeClaimsModal = () => setClaimsPrize(null);

  // Fetch claims for selected prize
  const claimsQuery = usePrizeClaims(claimsPrize?.id);

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Prizes</h1>
        <Button onClick={handleCreate}>Create Prize</Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error.message || error.toString()}</div>
      ) : prizes && prizes.length > 0 ? (
        <div className="overflow-x-auto">
  <table className="min-w-full border text-sm">
    <thead>
              <tr className="bg-muted">
                <th className="px-3 py-2 border">Title</th>
                <th className="px-3 py-2 border">Amount</th>
                <th className="px-3 py-2 border">Start Time (EAT)</th>
                <th className="px-3 py-2 border">Duration (min)</th>
                <th className="px-3 py-2 border">Max Winners</th>
                <th className="px-3 py-2 border">Status</th>
                <th className="px-3 py-2 border">Actions</th>
      </tr>
    </thead>
    <tbody>
              {prizes.map(prize => (
                <tr key={prize.id} className="border-b">
                  <td className="px-3 py-2 border">{prize.title}</td>
                  <td className="px-3 py-2 border">{prize.amount}</td>
                  <td className="px-3 py-2 border">{prize.startTimeUTC}</td>
                  <td className="px-3 py-2 border">{prize.durationMinutes}</td>
                  <td className="px-3 py-2 border">{prize.maxWinners}</td>
                  <td className="px-3 py-2 border">
                    {prize.isActive ? <span className="text-green-600">Active</span> : <span className="text-muted-foreground">Inactive</span>}
          </td>
                  <td className="px-3 py-2 border space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(prize)}>Edit</Button>
            <Button size="sm" variant="secondary" onClick={() => handleViewClaims(prize)}>View Claims</Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(prize.id)}>Delete</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      ) : (
        <div className="text-muted-foreground">No prizes found.</div>
      )}

      {/* Prize Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrize ? 'Edit Prize' : 'Create Prize'}</DialogTitle>
          </DialogHeader>
          <PrizeForm
            initialData={editingPrize || undefined}
            onSuccess={() => setModalOpen(false)}
            mode={editingPrize ? 'edit' : 'create'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletePrizeId} onOpenChange={() => setDeletePrizeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this prize?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setDeletePrizeId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              deleteMutation.mutate(deletePrizeId);
              setDeletePrizeId(null);
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Claims Modal */}
      <Dialog open={!!claimsPrize} onOpenChange={closeClaimsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prize Claims for: {claimsPrize?.title}</DialogTitle>
          </DialogHeader>
          {claimsQuery.isLoading ? (
            <div>Loading...</div>
          ) : claimsQuery.error ? (
            <div className="text-red-600">{claimsQuery.error.message || claimsQuery.error.toString()}</div>
          ) : claimsQuery.data && claimsQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
  <tr className="bg-muted">
    <th className="px-2 py-2 border">ID</th>
    <th className="px-3 py-2 border text-left">Name</th>
    <th className="px-3 py-2 border text-right">Amount</th>
    <th className="px-3 py-2 border">Claimed At</th>
  </tr>
</thead>
<tbody>
  {claimsQuery.data.map((claim) => {
    const user = claim.node?.user;
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : claim.node?.userId || claim.nodeId;
    const amount = claim.amount ? Number(claim.amount).toLocaleString() : '-';
    const claimedAt = claim.createdAt ? new Date(claim.createdAt).toLocaleString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
    return (
      <tr key={claim.id} className="border-b">
        <td className="px-2 py-2 border text-center">{claim.id}</td>
        <td className="px-3 py-2 border text-left font-medium">{name}</td>
        <td className="px-3 py-2 border text-right">{amount}</td>
        <td className="px-3 py-2 border">{claimedAt}</td>
      </tr>
    );
  })}
</tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground">No claims for this prize.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

