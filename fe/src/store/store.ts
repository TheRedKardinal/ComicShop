import { configureStore } from '@reduxjs/toolkit'
import authReducer, { AUTH_STORAGE_KEY } from './authSlice'
import { apiSlice } from './apiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
})

store.subscribe(() => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(store.getState().auth))
  } catch {
    // storage non disponibile (es. modalità privata): la sessione resta solo in memoria
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
