import { addToast } from '@heroui/react'

const decodeIfEncoded = (text: string) => {
  try {
    const decoded = decodeURIComponent(text)

    return decoded !== text ? decoded : text
  } catch (e) {
    return text
  }
}

export const Copy = (originText: string) => {
  const text = decodeIfEncoded(originText)

  if (navigator?.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addToast({
          title: '成功',
          description: `${text}`, 
        })
      })
      .catch(() =>
        addToast({
          title: '错误',
          description: '复制失败! 请更换更现代的浏览器!',
          color: 'danger'
        })
      )
  } else {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed' // 避免滚动到页面底部
    textarea.style.opacity = '0' // 隐藏 textarea
    document.body.appendChild(textarea)
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (successful) {
        addToast({
          title: '成功',
          description: `${text}`,
          color: 'success'
        })
      } else {
        addToast({
          title: '错误',
          description: '复制失败! 请手动复制文本。',
          color: 'danger'
        })
      }
    } catch (err) {
      addToast({
        title: '错误',
        description: '复制失败! 请手动复制文本。',
        color: 'danger'
      })
    } finally {
      document.body.removeChild(textarea)
    }
  }
}
