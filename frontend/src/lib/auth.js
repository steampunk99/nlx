import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Auth atoms
export const userAtom = atomWithStorage('user', null)
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
)

// Auth utils
export function setAuthTokens(tokens) {
  // Support both object and separate arguments
  const { accessToken, refreshToken } = typeof tokens === 'object' 
    ? tokens 
    : { accessToken: arguments[0], refreshToken: arguments[1] }

  console.group('Setting Auth Tokens')
  console.log('Access Token:', !!accessToken)
  console.log('Refresh Token:', !!refreshToken)
  console.trace('Token Setting Trace')
  console.groupEnd()

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

  console.group('Getting Auth Tokens')
  console.log('Access Token Present:', !!tokens.accessToken)
  console.log('Refresh Token Present:', !!tokens.refreshToken)
  console.trace('Token Retrieval Trace')
  console.groupEnd()

  return tokens
}
