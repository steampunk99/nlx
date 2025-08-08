import { api } from '../lib/axios'

/**
 * Track a referral link click. This endpoint doesn't require authentication
 * since users aren't logged in when they click referral links.
 * 
 * @param {string} code - The referral code from URL search params
 * @returns {Promise<Object>} The response data or null if tracking fails
 */
export const trackReferralClick = async (code) => {
  try {
    if (!code) return null
    
    // Use public API endpoint since user isn't authenticated yet
    const response = await api.get(`/api/v1/network/referral/${code}/track`)
    return response.data
  } catch (error) {
    console.error('Failed to track referral click:', error)
    // Don't throw error
    return null
  }
}
