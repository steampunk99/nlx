import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { useToast } from '../components/ui/use-toast';

export function useAdminPackages() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createPackage = useMutation({
    mutationFn: async (data) => {
      const packageData = {
        name: data.name,
        description: data.description,
        price: data.price,
        level: data.level,
        features: data.features,
        benefits: data.benefits,
        maxNodes: data.maxNodes || 1,
        duration: data.duration || 30,
        status: data.status || 'ACTIVE'
      };

      const response = await api.post('/packages/admin', packageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      toast({
        title: "Success",
        description: "Package created successfully",
      });
    },
    onError: (error) => {
      console.error('Create package error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, data }) => {
      const packageData = {
        name: data.name,
        description: data.description,
        price: data.price,
        level: data.level,
        features: data.features,
        benefits: data.benefits,
        maxNodes: data.maxNodes,
        duration: data.duration,
        status: data.status
      };

      const response = await api.put(`/packages/admin/${id}`, packageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update package error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const togglePackageStatus = useMutation({
    mutationFn: (id) => api.patch(`/packages/admin/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      toast({
        title: "Success",
        description: "Package status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Toggle package status error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update package status",
        variant: "destructive",
      });
    },
  });

  const deletePackage = useMutation({
    mutationFn: (id) => api.delete(`/packages/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete package error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

  return {
    createPackage,
    updatePackage,
    togglePackageStatus,
    deletePackage,
    usePackageStats: () => useQuery(['packageStats'], () => 
      api.get('/packages/admin/stats').then(res => res.data.data)
    )
  };
}
