import { useState, useEffect } from 'react';
import { getCurrency } from 'country-currency-map';

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
  const [country, setCountry] = useState('UG');
  const [currency, setCurrency] = useState({ code: 'UGX', symbol: 'USh' });
  const [loading, setLoading] = useState(true);
  const conversionRate = 3900; // USDT to UGX conversion rate

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('IP API Response:', data);
        
        const countryCode = data.country || 'UG';
        setCountry(countryCode);
        
        // Get currency information from our mappings first
        const currencyInfo = CURRENCY_MAPPINGS[countryCode] || CURRENCY_MAPPINGS['UG'];
        console.log('Currency Info for', countryCode, ':', currencyInfo);
        
        setCurrency(currencyInfo);
      } catch (error) {
        console.error('Error detecting country:', error);
        // Fallback to Uganda as default
        setCountry('UG');
        setCurrency(CURRENCY_MAPPINGS['UG']);
      } finally {
        setLoading(false);
      }
    };

    detectCountry();
  }, []);

  const formatAmount = (amount) => {
    // If currency is UGX, show the original amount
    if (currency.code === 'UGX') {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    // For other currencies, convert from UGX using USDT as intermediate
    const amountInUSDT = amount / conversionRate;
    
    // Conversion rates from USDT
    const rates = {
      'EUR': 0.91,  // 1 USDT = 0.91 EUR
      'USD': 1,     // 1 USDT = 1 USD
      'GBP': 0.79,  // 1 USDT = 0.79 GBP
      'KES': 157,   // 1 USDT = 157 KES
      'TZS': 2490,  // 1 USDT = 2490 TZS
      'NGN': 907,   // 1 USDT = 907 NGN
      'ZAR': 18.7   // 1 USDT = 18.7 ZAR
    };
    
    const rate = rates[currency.code] || 1;
    const convertedAmount = amountInUSDT * rate;
    
    console.log(`Converting ${amount} UGX to ${currency.code}:`, {
      amountInUSDT,
      rate,
      finalAmount: convertedAmount
    });

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  return {
    country,
    currency,
    loading,
    formatAmount,
    conversionRate
  };
}
