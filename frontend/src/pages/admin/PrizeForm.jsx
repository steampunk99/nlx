import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { usePrizeConfig } from '../../hooks/usePrizeAdmin';

export default function PrizeForm({ initialData, onSuccess, mode }) {
  const { createOrUpdateConfig, isLoading, error } = usePrizeConfig();
  const [form, setForm] = useState({
    title: '',
    amount: '',
    startTimeUTC: '',
    durationMinutes: '',
    maxWinners: '',
    isActive: false
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        amount: initialData.amount || '',
        startTimeUTC: initialData.startTimeUTC || '',
        durationMinutes: initialData.durationMinutes || '',
        maxWinners: initialData.maxWinners || '',
        isActive: !!initialData.isActive
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    try {
      await createOrUpdateConfig({
        ...form,
        amount: Number(form.amount),
        durationMinutes: Number(form.durationMinutes),
        maxWinners: Number(form.maxWinners)
      }, initialData?.id);
      setSuccess('Prize config saved!');
      if (onSuccess) onSuccess();
    } catch (err) {}
  };

  return (
    <CardContent>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" value={form.amount} onChange={handleChange} required min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTimeUTC">Start Time (EAT, HH:mm)</Label>
          <Input id="startTimeUTC" name="startTimeUTC" value={form.startTimeUTC} onChange={handleChange} required placeholder="13:00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" value={form.durationMinutes} onChange={handleChange} required min={1} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxWinners">Max Winners</Label>
          <Input id="maxWinners" name="maxWinners" type="number" value={form.maxWinners} onChange={handleChange} required min={1} />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="isActive" name="isActive" checked={form.isActive} onCheckedChange={val => setForm(f => ({ ...f, isActive: val }))} />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">{mode === 'edit' ? 'Update' : 'Create'}</Button>
      </form>
      <div className="mt-4 space-y-2">
        {success && (
          <Alert variant="success">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error?.message || error?.toString?.() || error}</AlertDescription>
          </Alert>
        )}
        {isLoading && <div className="text-muted-foreground">Loading...</div>}
      </div>
    </CardContent>
  );
}
