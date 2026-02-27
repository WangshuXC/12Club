export const markdownToText = (markdown: string) => {
  return (
    markdown

      // 移除 frontmatter (YAML 元数据)
      .replace(/^---[\s\S]*?---\n?/m, '')

      // 移除链接，保留链接文本
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

      // 移除图片，保留 alt 文本（如果有的话）
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')

      // 移除粗体标记，保留内容
      .replace(/(\*\*|__)(.*?)\1/g, '$2')

      // 移除斜体标记，保留内容
      .replace(/(\*|_)(.*?)\1/g, '$2')

      // 移除删除线标记，保留内容
      .replace(/~~(.*?)~~/g, '$1')

      // 移除标题标记，保留标题文本，并在后面添加换行
      .replace(/^\s*(#{1,6})\s+(.*)/gm, '$2\n')

      // 移除代码块（完全移除，不保留内容）
      .replace(/```[\s\S]*?```/g, '')

      // 移除行内代码标记，保留代码内容
      .replace(/`([^`]*)`/g, '$1')

      // 移除分隔线
      .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')

      // 移除列表标记
      .replace(/^\s*([-*+]|\d+\.)\s+/gm, '')

      // 移除引用标记
      .replace(/^\s*>\s*/gm, '')

      // 移除表格分隔符
      .replace(/^\s*\|.*\|\s*$/gm, '')

      // 将多个连续换行符替换为单个换行符
      .replace(/\n{2,}/g, '\n')

      // 移除多余的空格
      .replace(/[ \t]+/g, ' ')

      // 移除首尾空白
      .trim()
  )
}

// 新增：专门用于中文字数统计的函数
export const getWordCount = (text: string): number => {
  const cleanText = markdownToText(text)

  // 分别统计中文字符和英文单词
  const chineseChars = (cleanText.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = cleanText
    .replace(/[\u4e00-\u9fff]/g, '') // 移除中文字符
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  // 返回中文字数 + 英文单词数
  return chineseChars + englishWords
}
