'use client'

import {
  Button,
  ButtonGroup,
  Checkbox,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem
} from '@heroui/react'
import { ChevronDownIcon } from 'lucide-react'

import { useAdminResourceStore } from '@/store/adminResourceStore'

interface Props {
  onChange?: () => void
}

export const AdminResourceOption = ({ onChange }: Props) => {
  const searchData = useAdminResourceStore((state) => state.data)
  const setSearchData = useAdminResourceStore((state) => state.setData)

  const updateSearchData = (data: typeof searchData) => {
    setSearchData(data)
    onChange?.()
  }

  // 生成选中项的显示文本
  const getSelectedText = () => {
    const selected = []
    if (searchData.searchInAnime) selected.push('动漫')
    if (searchData.searchInComic) selected.push('漫画')
    if (searchData.searchInGame) selected.push('游戏')
    if (searchData.searchInNovel) selected.push('小说')

    if (selected.length === 0) return '筛选类型'
    if (selected.length === 4) return '全部类型'
    return selected.join('、')
  }

  return (
    <ButtonGroup variant="flat" className="rounded-lg overflow-hidden">
      <Button variant="solid" className="cursor-default">
        <p className="text-sm w-[180px] truncate">{getSelectedText()}</p>
      </Button>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button variant="solid" isIconOnly>
            <ChevronDownIcon className="w-4 h-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="资源筛选选项"
          disallowEmptySelection={false}
          closeOnSelect={false}
        >
          <DropdownSection title="资源类型筛选" showDivider={false}>
            <DropdownItem
              key="anime"
              textValue="包含动漫"
              closeOnSelect={false}
            >
              <Checkbox
                isSelected={searchData.searchInAnime}
                onValueChange={(checked) =>
                  updateSearchData({ ...searchData, searchInAnime: checked })
                }
                classNames={{
                  base: 'w-full max-w-full',
                  wrapper: 'mr-2'
                }}
              >
                包含动漫
              </Checkbox>
            </DropdownItem>
            <DropdownItem
              key="comic"
              textValue="包含漫画"
              closeOnSelect={false}
            >
              <Checkbox
                isSelected={searchData.searchInComic}
                onValueChange={(checked) =>
                  updateSearchData({ ...searchData, searchInComic: checked })
                }
                classNames={{
                  base: 'w-full max-w-full',
                  wrapper: 'mr-2'
                }}
              >
                包含漫画
              </Checkbox>
            </DropdownItem>
            <DropdownItem key="game" textValue="包含游戏" closeOnSelect={false}>
              <Checkbox
                isSelected={searchData.searchInGame}
                onValueChange={(checked) =>
                  updateSearchData({ ...searchData, searchInGame: checked })
                }
                classNames={{
                  base: 'w-full max-w-full',
                  wrapper: 'mr-2'
                }}
              >
                包含游戏
              </Checkbox>
            </DropdownItem>
            <DropdownItem
              key="novel"
              textValue="包含小说"
              closeOnSelect={false}
            >
              <Checkbox
                isSelected={searchData.searchInNovel}
                onValueChange={(checked) =>
                  updateSearchData({ ...searchData, searchInNovel: checked })
                }
                classNames={{
                  base: 'w-full max-w-full',
                  wrapper: 'mr-2'
                }}
              >
                包含小说
              </Checkbox>
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  )
}
