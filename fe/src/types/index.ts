export interface Item {
  id: string
  name: string
  price: number
  author: string | null
  publisher: string | null
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
