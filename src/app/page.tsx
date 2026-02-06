export const dynamic = 'force-dynamic'

export const revalidate = 0
import { HomeContainer } from '@/components/homeContainer'

import { getActions } from './actions'

export default async function Home() {
  const response = await getActions()

  return <HomeContainer {...response} />
}
