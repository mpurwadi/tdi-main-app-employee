// Utility functions for safe locale handling
import { IRootState } from '@/store';

/**
 * Safely get locale from themeConfig with fallback
 * @param themeConfig - The theme configuration object
 * @param fallback - Fallback locale if none found (default: 'en')
 * @returns Locale string
 */
export const getSafeLocale = (themeConfig: IRootState['themeConfig'] | undefined, fallback = 'en'): string => {
  try {
    // Check if themeConfig exists and has locale property
    if (themeConfig && typeof themeConfig.locale === 'string') {
      return themeConfig.locale;
    }
    
    // Try to get from localStorage during client-side
    if (typeof window !== 'undefined') {
      const storedLocale = localStorage.getItem('i18nextLng');
      if (storedLocale && typeof storedLocale === 'string') {
        return storedLocale;
      }
    }
    
    // Return fallback if nothing else works
    return fallback;
  } catch (error) {
    // In case of any error, return fallback
    return fallback;
  }
};

/**
 * Safely get translation function with fallback
 * @param t - Translation function from useTranslation
 * @returns Safe translation function
 */
export const getSafeTranslation = (t: Function | undefined): Function => {
  // If t function exists and is callable, return it
  if (t && typeof t === 'function') {
    return t;
  }
  
  // Return fallback function that returns the key
  return (key: string) => key;
};

/**
 * Formats a number into Indonesian Rupiah (IDR) currency format.
 * @param amount - The number to format.
 * @returns A string representing the amount in IDR format (e.g., "Rp 50.000").
 */
export const formatToRupiah = (amount: number | string): string => {
  const number = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(number)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default {
  getSafeLocale,
  getSafeTranslation,
  formatToRupiah,
};