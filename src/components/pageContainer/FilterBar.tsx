'use client'

import { useState } from 'react'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Select,
  SelectItem
} from '@heroui/react'
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react'

import {
  ALL_SUPPORTED_LANGUAGE,
  SUPPORTED_LANGUAGE_MAP,
  ALL_SUPPORTED_STATUS,
  SUPPORTED_STATUS_MAP,
  SORT_FIELD_LABEL_MAP
} from '@/constants/resource'

import type { SortField, SortOrder } from './_sort'

interface Props {
  selectedType: string
  setSelectedType: (types: string) => void
  sortField: SortField
  setSortField: (option: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (direction: SortOrder) => void
  selectedLanguage: string
  setSelectedLanguage: (language: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  page: number
  setPage: (page: number) => void
}

export const FilterBar = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  selectedLanguage,
  setSelectedLanguage,
  selectedStatus,
  setSelectedStatus,
  page,
  setPage
}: Props) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const hasActiveFilters =
    selectedLanguage !== 'all' || selectedStatus !== 'all'

  return (
    <Card className="w-full border border-default-100 bg-content1/50 backdrop-blur-lg">
      <CardHeader>
        <div className="flex flex-col w-full gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="w-full justify-between text-sm"
                  endContent={<ChevronDown className="size-4" />}
                >
                  {SORT_FIELD_LABEL_MAP[sortField]}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="排序选项"
                selectedKeys={new Set([sortField])}
                onAction={(key) => {
                  setSortField(key as SortField)
                  setPage(1)
                }}
                selectionMode="single"
                className="min-w-[120px]"
              >
                <DropdownItem key="updated" className="text-default-700">
                  更新时间
                </DropdownItem>
                <DropdownItem key="created" className="text-default-700">
                  发布时间
                </DropdownItem>
                <DropdownItem key="released" className="text-default-700">
                  发行时间
                </DropdownItem>
                <DropdownItem key="view" className="text-default-700">
                  浏览量
                </DropdownItem>
                <DropdownItem key="download" className="text-default-700">
                  下载量
                </DropdownItem>
                <DropdownItem key="comment" className="text-default-700">
                  评论量
                </DropdownItem>
                <DropdownItem key="favorite_by" className="text-default-700">
                  收藏量
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              variant="flat"
              className="text-sm shrink-0"
              onPress={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                setPage(1)
              }}
              startContent={
                sortOrder === 'asc' ? (
                  <ArrowUpAZ className="size-4" />
                ) : (
                  <ArrowDownAZ className="size-4" />
                )
              }
            >
              <span className="sm:hidden">
                {sortOrder === 'asc' ? '升序' : '降序'}
              </span>
              <span className="hidden sm:inline">
                {sortOrder === 'asc' ? '升序' : '降序'}
              </span>
            </Button>
          </div>

          <Button
            variant={showAdvancedFilters ? 'solid' : 'flat'}
            className="sm:w-auto text-sm"
            onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
            endContent={
              showAdvancedFilters ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )
            }
            color={hasActiveFilters ? 'primary' : 'default'}
          >
            高级筛选
          </Button>
        </div>
      </CardHeader>
      {showAdvancedFilters && (
        <>
          <Divider />
          <CardBody className="pt-3">
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <Select
                  label="语言筛选"
                  placeholder="选择语言"
                  selectedKeys={[selectedLanguage]}
                  onChange={(event) => {
                    if (!event.target.value) {
                      return
                    }

                    setSelectedLanguage(event.target.value)
                  }}
                  startContent={<Filter className="size-4 text-default-400" />}
                  radius="lg"
                  size="sm"
                >
                  {ALL_SUPPORTED_LANGUAGE.map((language) => (
                    <SelectItem key={language} className="text-default-700">
                      {SUPPORTED_LANGUAGE_MAP[language]}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="是否完结"
                  placeholder="选择状态"
                  selectedKeys={[selectedStatus]}
                  onChange={(event) => {
                    if (!event.target.value) {
                      return
                    }

                    setSelectedStatus(event.target.value)
                  }}
                  startContent={<Filter className="size-4 text-default-400" />}
                  radius="lg"
                  size="sm"
                >
                  {ALL_SUPPORTED_STATUS.map((status) => (
                    <SelectItem key={status} className="text-default-700">
                      {SUPPORTED_STATUS_MAP[status]}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <Button
                radius="lg"
                size="lg"
                variant="flat"
                className="text-sm ml-auto"
                onPress={() => {
                  setSelectedLanguage('all')
                  setSelectedStatus('all')
                }}
              >
                重置筛选
              </Button>
            </div>
          </CardBody>
        </>
      )}
    </Card>
  )
}
