export interface NavItem {
  name: string
  href: string
}

export const NavItemList: NavItem[] = [
  {
    name: '动画',
    href: '/anime'
  },
  {
    name: '漫画',
    href: '/comic'
  },
  {
    name: '游戏',
    href: '/game'
  },
  {
    name: '小说',
    href: '/novel'
  },

  // {
  //   name: '音乐',
  //   href: '/music'
  // },
  {
    name: '帮助文档',
    href: '/doc'
  }
]

export const MobileNavItemList: NavItem[] = [
  ...NavItemList,

  // {
  //   name: '评论列表',
  //   href: '/comment'
  // },
  // {
  //   name: '下载资源列表',
  //   href: '/resource'
  // },
  {
    name: '联系我们',
    href: '/doc/notice/feedback'
  }
]
