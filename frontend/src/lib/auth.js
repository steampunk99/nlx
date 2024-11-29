import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Auth atoms
export const userAtom = atomWithStorage('user', null)
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
)

// Auth utils
export function setAuthTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken)
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export function clearAuthTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getAuthTokens() {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}
