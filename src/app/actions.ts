import { getHomeData } from './api/home/route'

export const getActions = async () => {
  const response = await getHomeData()

  return response
}
