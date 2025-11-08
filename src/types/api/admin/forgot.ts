export interface ResetCode {
  id: number
  resetCode: string
  userName: string
  userEmail: string
  userId: number
  user: {
    id: number
    name: string
    email: string
    avatar: string
    role: number
    status: number
  }
  createdAt: string
  status: number
}

export interface ResetCodeStats {
  total: number
}
