// 埋点属性类型声明
// 扩展 React HTML 属性以支持埋点指令

import 'react'

declare module 'react' {
  interface HTMLAttributes<T> {
    /**
     * 曝光埋点 - 当元素进入视口时触发
     * 值为事件名称
     * @example <div log-expose="card_expose">内容</div>
     */
    'log-expose'?: string

    /**
     * 点击埋点 - 当元素被点击时触发
     * 值为事件名称
     * @example <button log-click="button_click">按钮</button>
     */
    'log-click'?: string

    /**
     * 全量埋点 - 同时监听曝光和点击
     * 值为事件名称前缀，曝光事件为 "{value}_expose"，点击事件为 "{value}_click"
     * @example <div log-all="card">内容</div>
     */
    'log-all'?: string

    /**
     * 埋点额外数据 - 以 data-log-* 格式传递
     * @example <div log-click="buy" data-log-product-id="123" data-log-price="99.9">购买</div>
     */
    [key: `data-log-${string}`]: string | number | boolean | undefined
  }
}
