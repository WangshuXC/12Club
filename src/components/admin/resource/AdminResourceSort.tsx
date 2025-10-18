'use cilent'

import { useAdminResourceStore } from '@/store/adminResourceStore'
import { Button, ButtonGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'
import { SORT_FIELD_LABEL_MAP } from '@/constants/resource'
import type { SortField } from '@/components/pageContainer/_sort'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'

export const AdminResourceSort = () => {
  const searchData = useAdminResourceStore((state) => state.data)
  const setSearchData = useAdminResourceStore((state) => state.setData)


  return(
    <ButtonGroup
      variant="flat"
      className="rounded-lg overflow-hidden flex-shrink-0"
    >
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button variant='solid'>
            {SORT_FIELD_LABEL_MAP[searchData.sortField]}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="排序选项"
          selectedKeys={new Set([searchData.sortField])}
          onAction={(key) => {
            setSearchData({ ...searchData, sortField: key as SortField })
          }}
          selectionMode="single"
          className="cursor-default"
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
        variant='solid'
        isIconOnly
        onPress={() => {
          setSearchData({ ...searchData, sortOrder: searchData.sortOrder === 'asc' ? 'desc' : 'asc' })
        }}
      >
        {searchData.sortOrder === 'asc' ? (
          <ArrowUpAZ className="size-4" />
        ) : (
          <ArrowDownAZ className="size-4" />
        )}
      </Button>
    </ButtonGroup>
  )
}