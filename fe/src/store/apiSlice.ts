import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './store'
import type {
  AuthResponse,
  Item,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
} from '../types'

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // In sviluppo e' vuota e il proxy di Vite inoltra /api alla 8080.
    // In produzione arriva da VITE_API_URL, iniettata durante la build.
    baseUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Items'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (payload) => ({ url: '/api/auth/login', method: 'POST', body: payload }),
    }),
    register: builder.mutation<AuthResponse, RegisterPayload>({
      query: (payload) => ({ url: '/api/auth/register', method: 'POST', body: payload }),
    }),
    logout: builder.mutation<MessageResponse, void>({
      query: () => ({ url: '/api/auth/logout', method: 'POST' }),
    }),
    getItems: builder.query<Item[], void>({
      query: () => '/api/items',
      providesTags: ['Items'],
    }),
    addFavourite: builder.mutation<MessageResponse, string>({
      query: (itemId) => ({ url: `/api/items/${itemId}/favourites`, method: 'POST' }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSlice.util.updateQueryData('getItems', undefined, (draft) => {
            const item = draft.find((entry) => entry.id === itemId)
            if (item) item.favourite = true
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    removeFavourite: builder.mutation<MessageResponse, string>({
      query: (itemId) => ({ url: `/api/items/${itemId}/favourites`, method: 'DELETE' }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          apiSlice.util.updateQueryData('getItems', undefined, (draft) => {
            const item = draft.find((entry) => entry.id === itemId)
            if (item) item.favourite = false
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetItemsQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
} = apiSlice
