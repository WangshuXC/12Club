'use client'

import { useEffect, useState } from 'react'
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle
} from '@heroui/react'
import Link from 'next/link'

import { usePathname } from 'next/navigation'
import { NavItemList } from '@/constants/top-bar'

import { TopBarBrand } from './Brand'
import { MobileMenu } from './MobileMenu'
import { TopBarUser } from './User'

import { useTransitionRouter } from 'next-view-transitions'
import { slideInOut } from '@/lib/routerTransition'

export const TopBar = () => {
  const pathname = usePathname()
  const router = useTransitionRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{ wrapper: 'px-3 container' }}
    >
      <NavbarContent className="2xl:hidden" justify="start">
        <li className="h-full">
          <NavbarMenuToggle />
        </li>
      </NavbarContent>

      <TopBarBrand />

      <NavbarContent className="hidden gap-3 2xl:flex w-screen">
        {NavItemList.map((item: any) => (
          <NavbarItem key={item.href} isActive={pathname.includes(item.href)}>
            <Link
              className={
                pathname.includes(item.href)
                  ? 'text-primary'
                  : 'text-foreground'
              }
              onClick={(e) => {
                e.preventDefault()
                router.push(item.href, {
                  onTransitionReady: slideInOut
                })
              }}
              href={item.href}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <TopBarUser />

      <MobileMenu />
    </Navbar>
  )
}
