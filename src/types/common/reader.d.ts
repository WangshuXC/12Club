// 在线阅读器相关类型定义

// 阅读器支持的文件格式
// foliate-js 原生支持：epub / mobi / azw3 / fb2 / cbz / pdf
// txt 使用自定义降级阅读器；unknown 表示无法识别
export type ReaderFormat =
  | 'epub'
  | 'mobi'
  | 'azw3'
  | 'fb2'
  | 'cbz'
  | 'pdf'
  | 'txt'
  | 'unknown'

// 单个可阅读文件（由 playList 记录映射而来）
export interface ReaderFile {
  index: number // 对应 playList 中的序号（从 0 开始）
  title: string // 显示标题，取 showAccordion || accordion
  link: string // 文件地址
  format: ReaderFormat // 由 link 扩展名识别
}

// 全屏阅读 Modal 的属性
export interface ReaderModalProps {
  isOpen: boolean
  onClose: () => void
  title: string // 作品标题
  files: ReaderFile[] // 全部可阅读文件
  initialIndex?: number // 初始打开的文件序号
}

// 阅读方向 / 布局模式
// paginated：左右分页翻页；scrolled：上下连续滚动
export type ReaderFlow = 'paginated' | 'scrolled'

// foliate-js 书籍的目录项（递归）
export interface BookTocItem {
  label: string
  href: string
  subitems?: BookTocItem[]
}

// 单个阅读器组件的通用属性
export interface ReaderViewProps {
  file: ReaderFile
  flow?: ReaderFlow
  // 阅读器就绪后回调，提供书内目录与跳转方法
  onReady?: (info: { toc: BookTocItem[]; goTo: (href: string) => void }) => void
  // scrolled 模式下：内部滚动到边界（顶/底）时回调，外层据此切换到相邻文件
  onScrollBoundary?: (direction: 'top' | 'bottom') => void
}
