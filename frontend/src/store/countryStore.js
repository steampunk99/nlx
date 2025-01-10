import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCountryStore = create(
  persist(
    (set) => ({
      country: 'UG',
      currency: { code: 'UGX', symbol: 'USh' },
      setCountryInfo: (country, currency) => set({ country, currency }),
    }),
    {
      name: 'country-store',
    }
  )
)

export default useCountryStore
