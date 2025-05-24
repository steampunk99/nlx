import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';

export function useNetworkStats() {
  return useQuery({
    queryKey: ['networkStats'],
    queryFn: async () => {
      const { data } = await api.get('/network/stats');
      console.log('Network stats response:', data);
      
      // Transform data to match frontend requirements
      return [
        {
          title: "Direct Referrals",
          value: data.data.directReferrals.toString(),
          description: "Members directly referred by you",
          icon: "UserPlus",
          trend: "+0 this month",
          color: "text-blue-500"
        },
        {
          title: "Total Network",
          value: data.data.totalTeam.toString(),
          description: "Total members in your downline",
          icon: "Users",
          trend: "+0 this month",
          color: "text-green-500"
        },
        {
          title: "Active Members",
          value: data.data.activeMembers.toString(),
          description: "Active members in your network",
          icon: "Users",
          trend: "+0 this month",
          color: "text-green-500"
        }
      ];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}



export function useNetworkLevels() {
  return useQuery({
    queryKey: ['networkLevels'],
    queryFn: async () => {
      const { data } = await api.get('/network/levels');
      console.log('Network levels response....:', data);
      
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Unexpected levels data format:', data);
        return [];
      }

      return data.data.map(level => ({
        level: level.level,
        members: level.members,
        active: level.active,
        commissions: level.commissionss // Already formatted as UGX string
      }));
     
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useRecentReferrals() {
  return useQuery({
    queryKey: ['recentReferrals'],
    queryFn: async () => {
      const { data } = await api.get('/network/referrals');
      console.log('Recent referrals response:', data);
      
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('Unexpected referrals data format:', data);
        return [];
      }

      return data.data.map(referral => ({
        id: referral.user.id,
        name: `${referral.user.firstName} ${referral.user.lastName}`,
        email: referral.user.email,
        status: referral.user.status,
        joinedAt: new Date(referral.user.createdAt).toLocaleDateString()
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      console.log('Dashboard stats response:', data);
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

//not showing in the dashboard and console log is empty

export function useEarnings() {
  return useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/earnings');
      console.log('Earnings response:', data.data);
      if (!data.data) {
        console.warn('No earnings data in response');
        return [];
      }
      return data.data;
    },
  
  });
}
export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/reward');
      console.log('Rewards response:', data.data);
      if (!data.data) {
        console.warn('No rewards data in response');
        return [];
      }
      return data.data
    },
 
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/activities');
      console.log('Recent activities response:', data);
      return data.data;
    },

  });
}

export function useGenealogyTree() {
  return useQuery({
    queryKey: ['genealogyTree'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/network/genealogy', {
          params: {
            depth: 5 // Get 5 levels deep
          }
        });
        console.log('Genealogy API response:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch genealogy data');
        }

        // Transform data for ReactFlow if needed
        if (data.data) {
          console.log('Processing genealogy data:', data.data);
          return data.data;
        } else {
          console.warn('No genealogy data in response');
          return null;
        }
      } catch (error) {
        console.error('Genealogy fetch error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
