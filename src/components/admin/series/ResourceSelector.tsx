'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  Input,
  Button,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Card,
  CardBody,
  Image,
  Chip,
  Spinner,
  Pagination
} from '@heroui/react'
import { Search, X } from 'lucide-react'
import { FetchPost } from '@/utils/fetch'

interface Resource {
  title: string
  image: string
  dbId: string
  view: number
  download: number
  status: number
  favorite_by: number
  comments: number
}

interface ResourceSelectorProps {
  selectedDbIds: string[]
  onSelectionChange: (dbIds: string[]) => void
  excludeDbIds?: string[] // 排除已在系列中的资源
}

export const ResourceSelector = ({
  selectedDbIds,
  onSelectionChange,
  excludeDbIds = []
}: ResourceSelectorProps) => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['anime', 'comic', 'game', 'novel'])
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  
  // 使用 ref 来存储排除的资源dbId，避免每次渲染时重新创建
  const excludeDbIdsRef = useRef<string[]>(excludeDbIds)
  // 标记是否已进行过首次搜索
  const hasSearched = useRef(false)
  
  // 当 excludeDbIds 发生实际变化时更新 ref
  const excludeIdsKey = useMemo(() => excludeDbIds.join(','), [excludeDbIds])
  useEffect(() => {
    excludeDbIdsRef.current = excludeDbIds
  }, [excludeIdsKey, excludeDbIds])

  const limit = 12

  // 获取资源列表
  const fetchResources = useCallback(async (searchQuery: string) => {
    // 只有当搜索框有内容时才触发搜索
    if (!searchQuery.trim()) {
      return
    }
    
    setLoading(true)
    hasSearched.current = true
    
    try {
      const searchData = {
        query: [searchQuery.trim()],
        page,
        limit,
        searchOption: {
          searchInIntroduction: false,
          searchInAlias: true,
          searchInTag: false,
          selectedResourceType: selectedTypes,
          selectedType: 'all',
          sortField: 'updated',
          sortOrder: 'desc',
          selectedLanguage,
          selectedStatus
        }
      }

      const response = await FetchPost('/search', searchData)
      
      if (typeof response === 'string') {
        console.error('搜索资源失败:', response)
        return
      }

      // 过滤掉已排除的资源，使用 ref 中的值
      const filteredResources = (response as any)._data.filter((resource: any) => {
        return !excludeDbIdsRef.current.includes(resource.dbId)
      })

      setResources(filteredResources)
      setTotal((response as any).total)
    } catch (error) {
      console.error('获取资源列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [page, selectedTypes, selectedLanguage, selectedStatus])

  // 当筛选条件变化时重新加载（仅在已搜索过且有搜索关键词时）
  useEffect(() => {
    if (hasSearched.current && query.trim()) {
      fetchResources(query)
    }
  }, [page, selectedTypes, selectedLanguage, selectedStatus])

  // 搜索处理
  const handleSearch = useCallback(() => {
    if (!query.trim()) {
      return
    }
    setPage(1)
    fetchResources(query)
  }, [query, fetchResources])

  // 资源选择处理
  const handleResourceToggle = useCallback((dbId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedDbIds, dbId])
    } else {
      onSelectionChange(selectedDbIds.filter(id => id !== dbId))
    }
  }, [selectedDbIds, onSelectionChange])

  // 获取资源状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '连载中'
      case 1: return '已完结'
      case 2: return '已停更'
      default: return '未知'
    }
  }

  // 获取资源状态颜色
  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'warning'
      case 1: return 'success'
      case 2: return 'danger'
      default: return 'default'
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="搜索资源名称..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
            startContent={<Search size={16} />}
            className="flex-1"
          />
          <Button color="primary" onPress={handleSearch}>
            搜索
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <CheckboxGroup
            label="资源类型"
            orientation="horizontal"
            value={selectedTypes}
            onValueChange={setSelectedTypes}
          >
            <Checkbox value="anime">动漫</Checkbox>
            <Checkbox value="comic">漫画</Checkbox>
            <Checkbox value="game">游戏</Checkbox>
            <Checkbox value="novel">小说</Checkbox>
          </CheckboxGroup>

          <Select
            label="语言"
            selectedKeys={[selectedLanguage]}
            onSelectionChange={(keys) => {
              const language = Array.from(keys)[0] as string
              if (language) setSelectedLanguage(language)
            }}
            className="w-32"
          >
            <SelectItem key="all">全部</SelectItem>
            <SelectItem key="zh">中文</SelectItem>
            <SelectItem key="ja">日文</SelectItem>
            <SelectItem key="en">英文</SelectItem>
            <SelectItem key="other">其他</SelectItem>
          </Select>

          <Select
            label="状态"
            selectedKeys={[selectedStatus]}
            onSelectionChange={(keys) => {
              const status = Array.from(keys)[0] as string
              if (status) setSelectedStatus(status)
            }}
            className="w-32"
          >
            <SelectItem key="all">全部</SelectItem>
            <SelectItem key="0">连载中</SelectItem>
            <SelectItem key="1">已完结</SelectItem>
            <SelectItem key="2">已停更</SelectItem>
          </Select>
        </div>
      </div>

      {/* 已选择的资源数量 */}
      {selectedDbIds.length > 0 && (
        <div className="flex items-center gap-2">
          <Chip color="primary" variant="flat">
            已选择 {selectedDbIds.length} 个资源
          </Chip>
          <Button
            size="sm"
            variant="light"
            color="danger"
            startContent={<X size={14} />}
            onPress={() => onSelectionChange([])}
          >
            清空选择
          </Button>
        </div>
      )}

      {/* 资源列表 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => {
            const isSelected = selectedDbIds.includes(resource.dbId)
            
            return (
              <Card
                key={resource.dbId}
                isPressable
                className={`${isSelected ? 'ring-2 ring-primary' : ''}`}
                onPress={() => handleResourceToggle(resource.dbId, !isSelected)}
              >
                <CardBody className="p-3">
                  <div className="flex gap-3">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      className="w-16 h-20 object-cover rounded"
                      fallbackSrc="/placeholder-image.jpg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" title={resource.title}>
                        {resource.title}
                      </h4>
                      <p className="text-xs text-default-500 mt-1">
                        ID: {resource.dbId}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Chip
                          size="sm"
                          color={getStatusColor(resource.status) as any}
                          variant="flat"
                        >
                          {getStatusText(resource.status)}
                        </Chip>
                      </div>
                      <div className="flex gap-2 text-xs text-default-500 mt-1">
                        <span>浏览: {resource.view}</span>
                        <span>下载: {resource.download}</span>
                      </div>
                    </div>
                    <Checkbox
                      isSelected={isSelected}
                      onValueChange={(checked) => handleResourceToggle(resource.dbId, checked)}
                    />
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={page}
            onChange={setPage}
            showControls
            showShadow
          />
        </div>
      )}

      {/* 空状态 */}
      {!loading && resources.length === 0 && (
        <div className="text-center py-8">
          <p className="text-default-500">
            {hasSearched.current ? '未找到符合条件的资源' : '请输入关键词搜索资源'}
          </p>
        </div>
      )}
    </div>
  )
}