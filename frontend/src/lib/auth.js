import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Auth atoms
export const userAtom = atomWithStorage('user', null)
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
)
//get user avatar fro

// Auth utils
export function setAuthTokens(tokens) {
  // Support both object and separate arguments
  const { accessToken, refreshToken } = typeof tokens === 'object' 
    ? tokens 
    : { accessToken: arguments[0], refreshToken: arguments[1] }



  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export function clearAuthTokens() {
  console.log('Clearing Auth Tokens')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getAuthTokens() {
  const tokens = {
    accessToken: localStorage.getItem('accessToken'),
    
    refreshToken: localStorage.getItem('refreshToken'),
  }




  return tokens
}
