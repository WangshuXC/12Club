import { getOpenlistToken } from '@/lib/openlist'
import { getRouteByDbId } from '@/utils/router'

interface GetFileListResult {
    success: boolean
    message: string
    data?: string[]
}

export async function getResourceFileList(
  dbId: string
): Promise<GetFileListResult> {
  try {
    // 获取 openlist token
    const tokenResult = await getOpenlistToken()

    if (!tokenResult.success || !tokenResult.token) {
      return {
        success: false,
        message: tokenResult.message
      }
    }

    const openlistToken = tokenResult.token
    const path = `/resource${getRouteByDbId(dbId)}`

    // 获取文件列表
    const getFileList = await fetch(
      `${process.env.NEXT_OPENLIST_API_ADRESS}/fs/list`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: openlistToken
        },
        body: JSON.stringify({
          path: path
        })
      }
    )

    if (!getFileList.ok) {
      return {
        success: false,
        message: '获取文件列表失败'
      }
    }

    const fileListData = await getFileList.json()
    const filePathList = fileListData.data['content'].filter(
      (item: any) => item.name !== 'banner.avif'
    )

    const fileList = filePathList.map((item: any) => {
      return encodeURI(`${process.env.IMAGE_BED_URL}${path}/${item.name}`)
    })

    return {
      success: true,
      message: '获取文件列表成功',
      data: fileList
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    }
  }
} 