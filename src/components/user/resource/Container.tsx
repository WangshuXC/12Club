'use client'

import { useEffect, useState } from 'react'

import { Loading } from '@/components/common/Loading'
import { Null } from '@/components/common/Null'
import { SelfPagination } from '@/components/common/Pagination'
import { useMounted } from '@/hooks/useMounted'
import { FetchGet } from '@/utils/fetch'

import { UserResourceCard } from './Card'

import type { UserResource as UserResourceType } from '@/types/api/user'

interface Props {
  resources: UserResourceType[]
  total: number
  uid: number
}

export const UserResource = ({ resources, total, uid }: Props) => {
  const isMounted = useMounted()
  const [patches, setPatches] = useState<UserResourceType[]>(resources)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchPatches = async () => {
    setLoading(true)

    const { resources } = await FetchGet<{
      resources: UserResourceType[]
      total: number
    }>('/user/profile/resource', {
      uid,
      page,
      limit: 20
    })

    setPatches(resources)
    setLoading(false)
  }

  useEffect(() => {
    if (!isMounted) {
      return
    }

    fetchPatches()
  }, [page])

  return (
    <div className="space-y-4">
      {loading ? (
        <Loading hint="正在获取资源数据..." />
      ) : (
        <>
          {patches.map((resource) => (
            <UserResourceCard key={resource.id} resource={resource} />
          ))}
        </>
      )}

      {!total && <Null message="还没有发布过资源哦" />}

      {total > 20 && (
        <div className="flex justify-center">
          <SelfPagination
            total={Math.ceil(total / 20)}
            page={page}
            onPageChange={setPage}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  )
}
