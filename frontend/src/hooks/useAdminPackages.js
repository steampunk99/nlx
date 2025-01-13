import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import toast from 'react-hot-toast';

export function useAdminPackages(options = {}) {
  const queryClient = useQueryClient();
  const { page = 1, limit = 10, status, level, search, sortBy, sortOrder } = options;

  // Get all packages with pagination and filters
  const {
    data: packagesData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['packages', { page, limit, status, level, search, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(status && { status }),
        ...(level && { level: String(level) }),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      });

      const response = await api.get(`/admin/packages?${params}`);
      return response.data;
    },
    placeholderData: (previousData) => previousData
  });

  // Get package statistics
  const { data: statsData } = useQuery({
    queryKey: ['packageStats'],
    queryFn: async () => {
      const response = await api.get('/admin/packages/stats');
      return response.data;
    }
  });

  // Create package mutation
  const createPackage = useMutation({
    mutationFn: async (data) => {
      const packageData = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        level: parseInt(data.level),
        status: data.status || 'ACTIVE',
        benefits: data.benefits ? JSON.stringify(data.benefits) : null,
        maxNodes: data.maxNodes ? parseInt(data.maxNodes) : 1,
        duration: data.duration ? parseInt(data.duration) : 30,
        features: data.features || null,
        dailyMultiplier: data.dailyMultiplier ? parseFloat(data.dailyMultiplier) : 1
      };

      const response = await api.post('/admin/packages', packageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package created successfully');
    },
    onError: (error) => {
      console.error('Create package error:', error);
      toast.error(error.response?.data?.message || 'Failed to create package');
    }
  });

  // Update package mutation
  const updatePackage = useMutation({
    mutationFn: async ({ id, data }) => {
      const packageData = {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        level: data.level ? parseInt(data.level) : undefined,
        status: data.status,
        benefits: data.benefits ? JSON.stringify(data.benefits) : undefined,
        maxNodes: data.maxNodes ? parseInt(data.maxNodes) : undefined,
        duration: data.duration ? parseInt(data.duration) : undefined,
        features: data.features,
        dailyMultiplier: data.dailyMultiplier ? parseFloat(data.dailyMultiplier) : undefined
      };

      // Remove undefined values
      Object.keys(packageData).forEach(key => {
        if (packageData[key] === undefined) {
          delete packageData[key];
        }
      });

      const response = await api.put(`/admin/packages/${id}`, packageData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast.success('Package updated successfully');
    },
    onError: (error) => {
      console.error('Update package error:', error);
      toast.error(error.response?.data?.message || 'Failed to update package');
    }
  });

  return {
    packages: packagesData?.data || [],
    pagination: packagesData?.pagination,
    stats: statsData?.data,
    isLoading,
    error,
    createPackage,
    updatePackage
  };
}
