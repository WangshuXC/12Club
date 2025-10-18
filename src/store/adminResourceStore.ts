import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SortField, SortOrder } from '@/components/pageContainer/_sort'

export interface AdminResourceStore {
  searchInAnime: boolean
  searchInComic: boolean
  searchInGame: boolean
  searchInNovel: boolean
  sortField: SortField
  sortOrder: SortOrder
}

const initialState: AdminResourceStore = {
  searchInAnime: true,
  searchInComic: true,
  searchInGame: true,
  searchInNovel: true,
  sortField: 'updated',
  sortOrder: 'desc'
}

interface AdminResourceStoreState {
  data: AdminResourceStore
  getData: () => AdminResourceStore
  setData: (data: AdminResourceStore) => void
  resetData: () => void
}

export const useAdminResourceStore = create<AdminResourceStoreState>()(
  persist((set, get) => ({
    data: initialState,
    getData: () => get().data,
    setData: (data: AdminResourceStore) => set({ data }),
    resetData: () => set({ data: initialState })
  }), {
    name: 'admin-resource-store',
  })
)