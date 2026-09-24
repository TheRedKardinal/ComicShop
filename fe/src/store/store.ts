import { configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import authReducer, { AUTH_STORAGE_KEY, clearAuth, setAuth } from './authSlice'
import { apiSlice } from './apiSlice'

// Il flag "favourite" dei fumetti dipende da chi è loggato: a ogni login/logout si ricarica la lista.
const authListener = createListenerMiddleware()
authListener.startListening({
  matcher: isAnyOf(setAuth, clearAuth),
  effect: (_action, api) => {
    api.dispatch(apiSlice.util.invalidateTags(['Items']))
  },
})

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(authListener.middleware).concat(apiSlice.middleware),
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
