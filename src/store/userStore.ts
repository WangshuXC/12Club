import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface UserState {
  uid: number
  name: string
  avatar: string
  bio: string
  role: number
  dailyCheckIn: number
  dailyImageLimit: number
  dailyUploadLimit: number
  enableEmailNotice: boolean

  excludedDomains?: string[]
  delaySeconds?: number
}

export interface UserStore {
  user: UserState
  setUser: (user: UserState) => void
  logout: () => void
}

const initialUserStore: UserState = {
  uid: 0,
  name: '',
  avatar: '',
  bio: '',
  role: 1,
  dailyCheckIn: 1,
  dailyImageLimit: 0,
  dailyUploadLimit: 0,
  enableEmailNotice: false,

  excludedDomains: [],
  delaySeconds: 5
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: initialUserStore,
      setUser: (user: UserState) => set({ user }),
      logout: () => set({ user: initialUserStore })
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
