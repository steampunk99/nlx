import { useState, useEffect } from 'react';
import useCountryStore from '../store/countryStore';
import { useAtom } from 'jotai';
import { userAtom } from '../lib/auth';

// Define currency mappings for common countries
const CURRENCY_MAPPINGS = {
  'FR': { code: 'EUR', symbol: '€' },
  'DE': { code: 'EUR', symbol: '€' },
  'IT': { code: 'EUR', symbol: '€' },
  'ES': { code: 'EUR', symbol: '€' },
  'GB': { code: 'GBP', symbol: '£' },
  'US': { code: 'USD', symbol: '$' },
  'UG': { code: 'UGX', symbol: 'USh' },
  'KE': { code: 'KES', symbol: 'KSh' },
  'TZ': { code: 'TZS', symbol: 'TSh' },
  'NG': { code: 'NGN', symbol: '₦' },
  'ZA': { code: 'ZAR', symbol: 'R' },
  'ZW': { code: 'ZWD', symbol: 'Z$' },
  'ZM': { code: 'ZMW', symbol: 'ZK' },
  'BJ': { code: 'XOF', symbol: 'CFA' },
  'BF': { code: 'XOF', symbol: 'CFA' },
  'GW': { code: 'XOF', symbol: 'CFA' },
  'CI': { code: 'XOF', symbol: 'CFA' },
  'ML': { code: 'XOF', symbol: 'CFA' },
  'NE': { code: 'XOF', symbol: 'CFA' },
  'SN': { code: 'XOF', symbol: 'CFA' },
  'TG': { code: 'XOF', symbol: 'CFA' },
  'CM': { code: 'XAF', symbol: 'FCFA' },
  'TD': { code: 'XAF', symbol: 'FCFA' },
  'GA': { code: 'XAF', symbol: 'FCFA' },
  'TN': { code: 'TND', symbol: 'DT' },
  'SZ': { code: 'SZL', symbol: 'L' },
  'SO': { code: 'SOS', symbol: 'Sh' },
  'SL': { code: 'SLL', symbol: 'Le' },
  'SD': { code: 'SDG', symbol: '£' },
  'RW': { code: 'RWF', symbol: 'FRw' },
  'NA': { code: 'NAD', symbol: 'N$' },
  'MZ': { code: 'MZN', symbol: 'MT' },
  'MW': { code: 'MWK', symbol: 'MK' },
  'MU': { code: 'MUR', symbol: '₨' },
  'MR': { code: 'MRO', symbol: 'UM' },
  'MG': { code: 'MGA', symbol: 'Ar' },
  'MA': { code: 'MAD', symbol: 'DH' },
  'LS': { code: 'LSL', symbol: 'L' },
  'LR': { code: 'LRD', symbol: 'L$' },
  'GN': { code: 'GNF', symbol: 'FG' },
  'GH': { code: 'GHS', symbol: '₵' },
  'ET': { code: 'ETB', symbol: 'Br' },
  'EG': { code: 'EGP', symbol: '£' },
  'CD': { code: 'CDF', symbol: 'FC' },
  'BW': { code: 'BWP', symbol: 'P' },
  'BI': { code: 'BIF', symbol: 'FBu' }
};

export function useCountry() {
  const { country, currency, setCountryInfo } = useCountryStore();
  const [loading, setLoading] = useState(false);
  const [user] = useAtom(userAtom);

  useEffect(() => {
    const setUserCountry = () => {
      setLoading(true);
      try {
        // Get country from user profile, fallback to UG if not available
        const userCountry = user?.country || 'UG';
        const currencyInfo = CURRENCY_MAPPINGS[userCountry] || CURRENCY_MAPPINGS['UG'];
        setCountryInfo(userCountry, currencyInfo);
      } catch (error) {
        console.error('Error setting country:', error);
        setCountryInfo('UG', CURRENCY_MAPPINGS['UG']);
      } finally {
        setLoading(false);
      }
    };

    setUserCountry();
  }, [user?.country]); // Re-run only when user's country changes

  const formatAmount = (amount) => {
    const value = Number(amount);
    if (isNaN(value)) return "0";
    
    // If currency is UGX, show the original amount
    if (currency.code === 'UGX') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }

    // Base conversion rates (1 USD = 3900 UGX)
    const UGX_TO_USD = 1 / 3900; // 1 UGX = 0.000256 USD
    
    // Direct conversion rates from UGX
    const directRates = {
      'EUR': UGX_TO_USD * 0.91,    // EUR/USD = 0.91
      'USD': UGX_TO_USD,           // 1 UGX = 0.000256 USD
      'GBP': UGX_TO_USD * 0.79,    // GBP/USD = 0.79
      'KES': 1 / 27.5713,          // 1 UGX = 0.0403 KES
      'TZS': 1 / 1.567,            // 1 UGX = 0.638 TZS
      'NGN': 1 / 4.21,             // 1 UGX = 0.232 NGN
      'ZAR': 1 / 208.77,           // 1 UGX = 0.00479 ZAR
      'ZMW': 1 / 123.091,          // 1 UGX = 0.00751 ZMW (from current rate)
      'XOF': 1 / 6.49,             // 1 UGX = 0.154 XOF
      'XAF': 1 / 6.49,             // 1 UGX = 0.154 XAF
      'ETB': 1 / 69.44,            // 1 UGX = 0.0144 ETB
      'GHS': 1 / 317.46            // 1 UGX = 0.00315 GHS
    };
    
    const rate = directRates[currency.code];
    if (!rate) {
      console.warn(`No conversion rate found for ${currency.code}, showing original amount`);
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    }
    
    const convertedAmount = amount * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  return {
    country,
    currency,
    loading,
    formatAmount
  };
}
