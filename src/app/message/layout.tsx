import type { ReactNode } from 'react'

import { MessageSidebar } from '@/components/message/Sidebar'

export default function MessageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full py-8 mx-auto px-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <MessageSidebar />
        </aside>
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  )
}
