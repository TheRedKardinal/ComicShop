export type ComicCategory = 'SUPEREROI' | 'FUMETTO_ITALIANO' | 'MANGA' | 'ALTRO'

export const CATEGORY_LABELS: Record<ComicCategory, string> = {
  SUPEREROI: 'Supereroi',
  FUMETTO_ITALIANO: 'Fumetto italiano',
  MANGA: 'Manga',
  ALTRO: 'Altro',
}

// Colore dominante per categoria (vedi i temi data-accent in theme.css). Supereroi/Marvel usano il rosso di default.
export type Accent = 'red' | 'dc' | 'italiano' | 'manga' | 'altro'

const CATEGORY_ACCENTS: Record<ComicCategory, Accent> = {
  SUPEREROI: 'red',
  FUMETTO_ITALIANO: 'italiano',
  MANGA: 'manga',
  ALTRO: 'altro',
}

export const getAccent = (category: ComicCategory | null, publisher: string | null): Accent =>
  publisher === 'DC Comics' ? 'dc' : category ? CATEGORY_ACCENTS[category] : 'red'

export interface Item {
  id: string
  name: string
  price: number
  author: string | null
  publisher: string | null
  category: ComicCategory
  coverUrl: string | null
  stock: number
  createdAt: string
  favourite: boolean
}

export interface AuthResponse {
  token: string
  userId: string
  username: string
  roles: string[]
}

export interface LoginPayload {
  usernameOrEmail: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface MessageResponse {
  message: string
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
}
