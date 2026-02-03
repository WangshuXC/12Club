'use client'

interface AliasListProps {
  aliases: string[]
  maxDisplay?: number
}

export const AliasList = ({ aliases, maxDisplay = 5 }: AliasListProps) => {
  if (aliases.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-default-200">
      <div className="text-xs text-default-500 leading-relaxed">
        <span className="text-default-400">别名：</span>
        {aliases.slice(0, maxDisplay).map((alias, index) => (
          <span key={index}>
            {index > 0 && <span className="mx-1 text-default-300">/</span>}
            <span>{alias}</span>
          </span>
        ))}
        {aliases.length > maxDisplay && (
          <span className="text-default-400">
            {' '}
            等{aliases.length}个别名
          </span>
        )}
      </div>
    </div>
  )
}
