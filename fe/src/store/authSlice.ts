import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthResponse } from '../types'

const STORAGE_KEY = 'comicshop-auth'

interface AuthState {
  token: string | null
  userId: string | null
  username: string | null
  roles: string[]
  isAuthenticated: boolean
  isAdmin: boolean
}

const initialState: AuthState = loadPersistedState()

function loadPersistedState(): AuthState {
  const empty: AuthState = {
    token: null,
    userId: null,
    username: null,
    roles: [],
    isAuthenticated: false,
    isAdmin: false,
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return empty
    const parsed = JSON.parse(raw) as Partial<AuthState>
    if (!parsed.token) return empty
    return { ...empty, ...parsed }
  } catch {
    return empty
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token
      state.userId = action.payload.userId
      state.username = action.payload.username
      state.roles = action.payload.roles
      state.isAuthenticated = true
      state.isAdmin = action.payload.roles.includes('Admin')
    },
    clearAuth: (state) => {
      state.token = null
      state.userId = null
      state.username = null
      state.roles = []
      state.isAuthenticated = false
      state.isAdmin = false
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
export { STORAGE_KEY as AUTH_STORAGE_KEY }
export type { AuthState }
