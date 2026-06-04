const AUTH_LAST_ACTIVITY_KEY = 'auth_last_activity'
export const AUTH_IDLE_TIMEOUT_MS = 5 * 60 * 1000

const authStorageKeys = ['auth_token', 'user_data', 'user', 'currentUser']

const readLastActivity = () => {
  const raw = localStorage.getItem(AUTH_LAST_ACTIVITY_KEY)
  if (!raw) return null

  const timestamp = Number(raw)
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
}

export const markAuthActivity = () => {
  if (!localStorage.getItem('auth_token')) return

  localStorage.setItem(AUTH_LAST_ACTIVITY_KEY, String(Date.now()))
}

export const isAuthSessionExpired = () => {
  const token = localStorage.getItem('auth_token')
  if (!token) return false

  const lastActivity = readLastActivity()
  if (!lastActivity) {
    markAuthActivity()
    return false
  }

  return Date.now() - lastActivity >= AUTH_IDLE_TIMEOUT_MS
}

export const clearAuthSession = () => {
  authStorageKeys.forEach((key) => localStorage.removeItem(key))
  localStorage.removeItem(AUTH_LAST_ACTIVITY_KEY)
}