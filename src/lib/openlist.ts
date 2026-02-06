interface OpenlistTokenResult {
    success: boolean
    message: string
    token?: string
}

/**
 * 获取 Openlist API Token
 * @returns {Promise<OpenlistTokenResult>} 包含成功状态、消息和 token 的对象
 */
export async function getOpenlistToken(): Promise<OpenlistTokenResult> {
  try {
    const response = await fetch(
      `${process.env.NEXT_OPENLIST_API_ADRESS}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: process.env.NEXT_OPENLIST_ADMIN_NAME,
          password: process.env.NEXT_OPENLIST_ADMIN_PASSWORD
        })
      }
    )

    if (!response.ok) {
      return {
        success: false,
        message: '获取token失败'
      }
    }

    const tokenData = await response.json()
    const token = tokenData.data['token']

    return {
      success: true,
      message: '获取token成功',
      token
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取token时发生未知错误'
    }
  }
}

