import { create } from 'zustand'
import { api } from '../lib/axios'

const useSiteConfigStore = create((set) => ({
  config: {
    // Site Information
    siteName: 'Mineral Traders',
    siteLogoUrl: null,
    siteBaseUrl: 'https://mineraltraders.net',
    promoImageUrl: null,

    // Payment Collection Numbers
    mtnCollectionNumber: null,
    airtelCollectionNumber: null,

    // Support Information
    supportPhone: null,
    supportEmail: null,
    supportLocation: null,

    // Currency Rates
    depositDollarRate: 3900.0,
    withdrawalDollarRate: 3900.0,
    withdrawalCharge: 2.0,

    // USDT Wallet
    usdtWalletAddress: null,
  },
  isLoading: false,
  error: null,
  fetchConfig: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/auth/config');
      set({ 
        config: {
          ...useSiteConfigStore.getState().config,
          ...data.data
        }, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch site config',
        isLoading: false 
      });
    }
  }
}));

export default useSiteConfigStore;
