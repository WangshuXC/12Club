'use client'

import { Select, SelectItem } from '@heroui/react'
import { Controller } from 'react-hook-form'
import { z } from 'zod'

import { storageTypes } from '@/constants/resource'
import { useUserStore } from '@/store/userStore'
import { patchResourceCreateSchema } from '@/validations/patch'

import type { ControlType, ErrorType } from '../share'

export type ResourceFormData = z.infer<typeof patchResourceCreateSchema>

interface Props {
  section: string
  control: ControlType
  errors: ErrorType
}

export const ResourceTypeSelect = ({ section, control, errors }: Props) => {
  const user = useUserStore((state) => state.user)

  const calcDisabledKeys = () => {
    if (user.role > 3 && section === 'individual') {
      return []
    }

    if (user.role > 3 && section === 'club') {
      return ['user']
    }

    if (user.role > 1 && section === 'individual') {
      return ['alist']
    }

    return ['user', 'alist']
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">选择存储类型</h3>
      <p className="text-sm text-default-500">
        确定您的资源体积大小以便选择合适的存储方式
      </p>

      <Controller
        name="storage"
        control={control}
        render={({ field }) => (
          <Select
            label="请选择您的资源存储类型"
            selectedKeys={[field.value]}
            onSelectionChange={(key) => {
              field.onChange(Array.from(key).join(''))
            }}
            disabledKeys={calcDisabledKeys()}
            isInvalid={!!errors.storage}
            errorMessage={errors.storage?.message}
          >
            {storageTypes.map((type) => (
              <SelectItem key={type.value} textValue={type.label}>
                <div className="flex flex-col">
                  <span className="text">{type.label}</span>
                  <span className="text-small text-default-500">
                    {type.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </Select>
        )}
      />
    </div>
  )
}
