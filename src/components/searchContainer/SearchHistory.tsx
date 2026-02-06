'use client'

import type { Dispatch, SetStateAction } from 'react'

import { Button } from '@heroui/react'
import { Clock, X } from 'lucide-react'

import { useSearchStore } from '@/store/searchStore'

interface Props {
  showHistory: boolean
  setShowHistory: Dispatch<SetStateAction<boolean>>
  setQuery: Dispatch<SetStateAction<string>>
  removeFromHistory: (index: number) => void
}

export const SearchHistory = ({
  showHistory,
  setShowHistory,
  setQuery,
  removeFromHistory
}: Props) => {
  const searchData = useSearchStore((state) => state.data)
  const setSearchData = useSearchStore((state) => state.setData)

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem)
    setShowHistory(false)
  }

  return (
    <>
      {showHistory && searchData.searchHistory.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border shadow-lg rounded-2xl bg-content1 border-default-200">
          <div className="flex items-center justify-between p-2">
            <span className="flex items-center ml-2 text-lg text-default-500">
              搜索历史
            </span>
            <Button
              size="md"
              variant="light"
              color="primary"
              onPress={() =>
                setSearchData({ ...searchData, searchHistory: [] })
              }
            >
              清除全部历史
            </Button>
          </div>

          <div className="overflow-y-auto max-h-60 p-2 pt-0">
            {searchData.searchHistory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-default-100 rounded-lg"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-default-400" />
                  <span>{item}</span>
                </div>

                <X
                  size={16}
                  className="hover:text-primary text-default-400 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromHistory(index)
                    setShowHistory(true)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
