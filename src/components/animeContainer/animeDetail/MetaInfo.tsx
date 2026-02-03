'use client'

interface MetaInfoProps {
  primaryItems: string[]
  secondaryItems: string[]
}

export const MetaInfo = ({ primaryItems, secondaryItems }: MetaInfoProps) => {
  if (primaryItems.length === 0 && secondaryItems.length === 0) return null

  const renderItems = (items: string[]) =>
    items.map((item, index) => (
      <span key={index}>
        {index > 0 && <span className="mx-1.5 text-default-300">·</span>}
        <span className="hover:text-primary cursor-default">{item}</span>
      </span>
    ))

  return (
    <div className="text-xs sm:text-sm text-default-500 mb-2 leading-relaxed">
      {/* 第一行：播放、下载、dbId */}
      {primaryItems.length > 0 && <div>{renderItems(primaryItems)}</div>}
      {/* 第二行：其他元信息 */}
      {secondaryItems.length > 0 && <div>{renderItems(secondaryItems)}</div>}
    </div>
  )
}
