import { Suspense } from 'react'

import { Announcement } from '@/components/admin/announcement'
import { ErrorComponent } from '@/components/common/Error'

import { getActions } from './actions'

export const revalidate = 3

export default async function AnnouncementPage() {
  const response = await getActions({
    page: 1,
    limit: 30
  })

  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <Suspense>
      <Announcement
        initialAnnouncements={response.announcements}
        initialTotal={response.total}
      />
    </Suspense>
  )
}
