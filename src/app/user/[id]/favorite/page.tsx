import { ErrorComponent } from '@/components/common/Error'
import { UserFavorite } from '@/components/user/favorite/Container'

import { getActions } from './actions'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export default async function FavoritePage({ params }: Props) {
  const { id } = await params

  const response = await getActions(Number(id))
  if (typeof response === 'string') {
    return <ErrorComponent error={response} />
  }

  return (
    <UserFavorite
      initialFolders={response.folders}
      pageUid={Number(id)}
      currentUserUid={response.currentUserUid}
    />
  )
}
