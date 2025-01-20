import { useEffect } from 'react';
import useSiteConfigStore from '../../store/siteConfigStore';

export function useSiteConfig() {
  const { config, isLoading, error, fetchConfig } = useSiteConfigStore();

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    siteName: config.siteName,
    siteLogoUrl: config.siteLogoUrl,
    siteBaseUrl: config.siteBaseUrl,
    promoImageUrl: config.promoImageUrl,
    mtnCollectionNumber: config.mtnCollectionNumber,
    airtelCollectionNumber: config.airtelCollectionNumber,
    supportPhone: config.supportPhone,
    supportEmail: config.supportEmail,
    supportLocation: config.supportLocation,
    depositDollarRate: config.depositDollarRate,
    withdrawalDollarRate: config.withdrawalDollarRate,
    withdrawalCharge: config.withdrawalCharge,
    usdtWalletAddress: config.usdtWalletAddress,
    isLoading,
    error
  };
}
