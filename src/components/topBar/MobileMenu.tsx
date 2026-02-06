'use client'

import { NavbarMenu, NavbarMenuItem } from '@heroui/react'
import Image from 'next/image'
import Link from 'next/link'

import { Config } from '@/config/config'
import { MobileNavItemList } from '@/constants/top-bar'

export const MobileMenu = () => {
  return (
    <NavbarMenu className="space-y-4">
      <NavbarMenuItem>
        <Link className="flex items-center" href="/">
          <Image
            src="/favicon.ico"
            alt={Config.titleShort}
            width={50}
            height={50}
            priority
          />
          <p className="ml-1 mr-2 text-3xl font-bold">{Config.creator.name}</p>
        </Link>
      </NavbarMenuItem>

      {MobileNavItemList.map((item: any, index: number) => (
        <NavbarMenuItem key={index}>
          <Link className="w-full font-semibold" href={item.href}>
            {item.name}
          </Link>
        </NavbarMenuItem>
      ))}
    </NavbarMenu>
  )
}
