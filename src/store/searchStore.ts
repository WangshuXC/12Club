import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { SortField, SortOrder } from '@/components/pageContainer/_sort'

export interface CreateSearchData {
  searchHistory: string[]
  searchInIntroduction: boolean
  searchInAlias: boolean
  selectedResourceType: string[]
  selectedType: string
  sortField: SortField
  sortOrder: SortOrder
  selectedLanguage: string
  selectedStatus: string
}

const initialState: CreateSearchData = {
  searchHistory: [],
  searchInIntroduction: true,
  searchInAlias: true,
  selectedResourceType: ['anime', 'comic', 'game', 'novel'],
  selectedType: 'all',
  sortField: 'updated',
  sortOrder: 'desc',
  selectedLanguage: 'all',
  selectedStatus: 'all'
}

interface SearchStoreState {
  data: CreateSearchData
  getData: () => CreateSearchData
  setData: (data: CreateSearchData) => void
  resetData: () => void
}

export const useSearchStore = create<SearchStoreState>()(
  persist(
    (set, get) => ({
      data: initialState,
      getData: () => get().data,
      setData: (data: CreateSearchData) => set({ data }),
      resetData: () => set({ data: initialState })
    }),
    {
      name: 'search-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
