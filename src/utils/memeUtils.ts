// Meme 表情相关工具函数

export interface MemeItem {
  name: string // 如: meme_wy
  displayName: string // 如: [meme_wy]
  fileName: string // 如: [meme_wy].gif
  path: string // 如: /meme/[meme_wy].gif
}

// 获取所有可用的 meme 列表
export const getMemeList = (): MemeItem[] => {
  const memeNames = [
    'meme_wy',
    'meme_bsc',
    'meme_yw',
    'meme_dy',
    'meme_bsw',
    'meme_qd',
    'meme_cdl',
    'meme_xx',
    'meme_yf',
    'meme_bb',
    'meme_qgg',
    'meme_yl',
    'meme_hy',
    'meme_tx',
    'meme_jy',
    'meme_xb'
  ]

  return memeNames.map((name) => ({
    name,
    displayName: `[${name}]`,
    fileName: `[${name}].gif`,
    path: `/meme/[${name}].gif`
  }))
}

// 从文本中提取所有的 meme 标记
export const extractMemesFromText = (text: string): MemeItem[] => {
  const memeRegex = /\[(meme_[^[\]]+)\]/g
  const matches: RegExpExecArray[] = []
  let match: RegExpExecArray | null

  while ((match = memeRegex.exec(text)) !== null) {
    matches.push(match)
  }

  const memeList = getMemeList()

  return matches
    .map((match) => {
      const memeName = match[1]

      return memeList.find((meme) => meme.name === memeName)
    })
    .filter((meme): meme is MemeItem => meme !== undefined)
}

// 在指定位置插入 meme 标记
export const insertMemeIntoText = (
  text: string,
  cursorPosition: number,
  memeDisplayName: string
): { newText: string; newCursorPosition: number } => {
  const before = text.substring(0, cursorPosition)
  const after = text.substring(cursorPosition)
  const newText = before + memeDisplayName + after
  const newCursorPosition = cursorPosition + memeDisplayName.length

  return { newText, newCursorPosition }
}
