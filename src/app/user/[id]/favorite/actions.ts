'use server'

import { getFolders } from '@/app/api/user/profile/favorite/folder/get'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

export const getActions = async (uid: number) => {
  const payload = await verifyHeaderCookie()
  if (!payload) {
    return '用户登陆失效'
  }

  const response = await getFolders({}, uid, payload.uid)

  return { folders: response, currentUserUid: payload.uid }
}
