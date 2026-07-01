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
import { useTransitionRouter } from 'next-view-transitions'

import { NavItemList, type NavItem } from '@/constants/top-bar'
import { slideInOut } from '@/lib/routerTransition'

import { TopBarBrand } from './Brand'
import { MobileMenu } from './MobileMenu'
import { TopBarUser } from './User'

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
      <NavbarContent className="md:hidden" justify="start">
        <li className="h-full">
          <NavbarMenuToggle />
        </li>
      </NavbarContent>

      <TopBarBrand />

      <NavbarContent className="hidden gap-3 md:flex w-screen">
        {NavItemList.map((item: NavItem) => (
          <NavbarItem key={item.href} isActive={pathname.includes(item.href)}>
            <Link
              className={
                pathname.includes(item.href)
                  ? 'text-primary cursor-pointer'
                  : 'text-foreground cursor-pointer'
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
