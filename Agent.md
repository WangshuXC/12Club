# Agent.md - 12Club 项目 AI 编码规范

> 本文件供 AI 编码助手在本项目中遵循，基于项目实际代码结构自动生成。

## 一、项目概述

12Club 是南开大学 ACG 社区资源分享平台。基于 Next.js 15 App Router 全栈架构，提供动漫在线观看、资源下载、用户社区等功能。

**核心技术栈**：

- **框架**: Next.js 15.5.5 (App Router + Turbopack) + React 19.2.0 + TypeScript 5.9.3
- **UI**: HeroUI 2.8.5 (`@heroui/react`) — 项目唯一组件库
- **图标**: Lucide React + Tabler Icons + React Icons
- **状态管理**: Zustand 5.0.3 (persist + createJSONStorage)
- **样式**: Tailwind CSS 4.1.14 + Sass 1.84.0
- **数据库**: Prisma 6.12.0 + PostgreSQL
- **缓存**: IORedis 5.6.0
- **存储**: AWS S3 SDK 3.758.0
- **认证**: JWT (jsonwebtoken) + Cookie (`12club-token`)
- **表单**: React Hook Form 7.54.2 + Zod 3.24.2
- **动画**: Framer Motion 11.15.0
- **视频**: Artplayer 5.3.0 + Plyr 3.7.8
- **图表**: Recharts 3.7.0
- **路由动画**: next-view-transitions 0.3.4
- **进度条**: next-nprogress-bar 2.4.4
- **通知**: HeroUI addToast (非 react-hot-toast)

## 二、开发命令

```bash
npm run dev              # 开发服务器 (Turbopack, 端口 9001)
npm run dev:no-tunnel    # 无 SSH 隧道开发
npm run build            # 生产构建
npm run start            # 启动生产服务器
npm run lint             # ESLint 检查
npm run format           # Prettier 格式化
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:push      # 推送 Schema 到数据库
npm run prisma:migrate   # 数据库迁移
npm run prisma:studio    # Prisma 可视化管理
```

## 三、代码格式 (Prettier)

```json
{
  "singleQuote": true,
  "semi": false,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "trailingComma": "none",
  "endOfLine": "auto"
}
```

## 四、HeroUI 组件使用规范

项目统一使用 `@heroui/react`，**禁止使用 shadcn/ui**。

### 4.1 按钮

```tsx
// ✅ 正确：HeroUI Button
import { Button } from '@heroui/react'
<Button color="primary" onPress={handler} isDisabled={loading} isLoading={loading}>
  提交
</Button>

// ❌ 错误：使用 onClick / disabled
<Button onClick={handler} disabled={loading}>提交</Button>
```

**Button 关键 API**:

- `onPress` 代替 `onClick`
- `isDisabled` 代替 `disabled`
- `isLoading` 显示加载状态
- `isIconOnly` 仅图标按钮
- `as={Link}` 作为链接使用
- variant: `"solid"` | `"flat"` | `"light"` | `"bordered"` | `"ghost"`
- color: `"primary"` | `"secondary"` | `"success"` | `"warning"` | `"danger"` | `"default"`

### 4.2 通知 Toast

```tsx
// ✅ 正确：使用 HeroUI addToast
import { addToast } from '@heroui/react'
addToast({ title: '成功', description: '操作成功!', color: 'success' })
addToast({ title: '错误', description: '操作失败', color: 'danger' })

// ❌ 错误：使用 react-hot-toast（仅旧代码残留）
import toast from 'react-hot-toast'
```

### 4.3 常用组件导入

```tsx
import {
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Avatar,
  User,
  Image,
  Link,
  Chip,
  Tooltip,
  Divider,
  Pagination,
  Skeleton,
  Spinner,
  Drawer,
  DrawerContent,
  Slider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  Tab,
  useDisclosure,
  addToast
} from '@heroui/react'
```

## 五、命名规范

| 类型         | 规范                  | 示例                                 |
| ------------ | --------------------- | ------------------------------------ |
| 组件名/文件  | PascalCase.tsx        | `CoverCard.tsx`, `FilterBar.tsx`     |
| 容器组件目录 | camelCase + Container | `homeContainer/`, `pageContainer/`   |
| Hook 文件    | camelCase.ts          | `useMounted.ts`, `useTracking.ts`    |
| 工具函数文件 | camelCase.ts          | `formatNumber.ts`, `errorHandler.ts` |
| 类型文件     | kebab-case.d.ts       | `detail-container.d.ts`              |
| Store 文件   | camelCase + Store.ts  | `userStore.ts`, `searchStore.ts`     |
| 常量文件     | kebab-case.ts         | `top-bar.ts`, `resource.ts`          |
| 验证文件     | camelCase.ts          | `admin.ts`, `auth.ts`                |
| 变量名       | camelCase             | `userData`, `isLoading`              |
| 函数名       | camelCase             | `getUserInfo`, `handleSubmit`        |
| 常量         | UPPER_SNAKE_CASE      | `MAX_FILE_SIZE`                      |
| 接口/类型    | PascalCase            | `UserState`, `AdminResource`         |

## 六、导入顺序规范

```tsx
// 1. React 相关
'use client' // 客户端组件标记（必须在文件首行）
import { useState, useEffect } from 'react'

// 2. 第三方库（按字母顺序）
import { Button, Card } from '@heroui/react'
import { Search } from 'lucide-react'
import { useRouter } from 'next-nprogress-bar'

// 3. 内部模块（按字母顺序）
import { CoverCard } from '@/components/common/CoverCard'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'
import { FetchGet } from '@/utils/fetch'

// 4. 类型导入（使用 type 关键字）
import type { UserState } from '@/store/userStore'
import type { AdminResource } from '@/types/api/admin'
```

## 七、项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   ├── providers.tsx             # 全局 Providers (HeroUI/Theme/Tracking)
│   ├── metadata.ts               # SEO 元数据
│   ├── actions.ts                # 全局 Server Actions
│   ├── error.tsx / not-found.tsx  # 错误页
│   ├── admin/                    # 管理后台
│   ├── anime/ comic/ game/ novel/ # 资源页面
│   ├── user/                     # 用户页面
│   ├── search/ login/ register/ forgot/ edit/ doc/
│   └── api/                      # API 路由
│       ├── admin/                # 管理 API
│       ├── auth/                 # 认证 API
│       ├── detail/               # 详情 API
│       ├── edit/                 # 编辑 API
│       ├── home/                 # 首页 API
│       ├── page/                 # 分页 API
│       ├── patch/                # 补丁 API
│       ├── search/               # 搜索 API
│       ├── tag/                  # 标签 API
│       ├── tracking/             # 埋点 API
│       └── user/                 # 用户 API
├── components/
│   ├── ui/                       # 基础 UI 组件 (自定义)
│   ├── common/                   # 公共业务组件
│   ├── topBar/                   # 顶部导航
│   ├── homeContainer/            # 首页容器
│   ├── pageContainer/            # 列表页容器
│   ├── searchContainer/          # 搜索容器
│   ├── detailContainer/          # 详情页容器
│   ├── animeContainer/           # 动漫页容器
│   ├── createContainer/          # 创建资源容器
│   ├── admin/                    # 管理后台组件
│   ├── user/                     # 用户组件
│   ├── LoginRegister/            # 登录注册
│   ├── doc/                      # 文档组件
│   └── tracking/                 # 埋点 Provider
├── lib/                          # 核心库封装
│   ├── utils.ts                  # cn() 工具函数
│   ├── redis.ts                  # Redis 客户端 (setKv/getKv/delKv)
│   ├── s3.ts                     # S3 存储操作
│   ├── routerTransition.ts       # 路由过渡动画
│   ├── imageLoader.ts            # 图片加载器
│   └── mdx/                      # MDX 处理
├── hooks/                        # 自定义 Hooks
│   ├── useMounted.ts             # 客户端挂载检测
│   ├── useOutsideClick.tsx       # 外部点击检测
│   ├── useResizeObserver.ts      # 尺寸监听
│   └── useTracking.ts            # 埋点追踪
├── store/                        # Zustand 状态管理
│   ├── globalStore.ts            # 全局状态 (设备信息)
│   ├── userStore.ts              # 用户状态 (认证, persist)
│   ├── searchStore.ts            # 搜索状态
│   ├── editStore.ts              # 编辑状态
│   ├── adminResourceStore.ts     # 管理资源状态
│   ├── trackingStore.ts          # 埋点状态
│   └── adminTrackingStore.ts     # 管理埋点状态
├── types/
│   ├── user.d.ts                 # 全局用户类型
│   ├── tracking.d.ts             # 全局追踪类型
│   ├── api/                      # API 响应类型
│   │   ├── admin.d.ts
│   │   ├── user.d.ts
│   │   ├── resource.d.ts
│   │   ├── comment.d.ts
│   │   ├── message.d.ts
│   │   ├── page.d.ts
│   │   ├── patch.d.ts
│   │   ├── search.d.ts
│   │   ├── announcement.d.ts
│   │   ├── tracking.d.ts
│   │   └── resource-play-link.d.ts
│   └── common/                   # 客户端组件类型
│       ├── index.d.ts
│       ├── home.d.ts
│       ├── page.d.ts
│       └── detail-container.d.ts
├── validations/                  # Zod Schema
│   ├── admin.ts
│   ├── auth.ts
│   ├── user.ts
│   ├── resource.ts
│   ├── comment.ts
│   ├── edit.ts
│   ├── search.ts
│   ├── page.ts
│   ├── patch.ts
│   └── series.ts
├── constants/                    # 常量定义
│   ├── resource.ts               # 资源类型/语言/状态映射
│   ├── admin.ts                  # 管理后台常量
│   ├── user.ts                   # 用户角色/状态映射
│   ├── message.ts                # 消息类型常量
│   ├── top-bar.ts                # 导航栏菜单
│   └── doc.ts                    # 文档目录映射
├── config/                       # 配置
│   ├── config.ts                 # 站点配置 (名称/URL)
│   ├── cache.ts                  # 缓存时长配置
│   └── user.ts                   # 用户限制配置
├── utils/                        # 工具函数
│   ├── fetch.ts                  # HTTP 请求封装 (必须使用)
│   ├── parseQuery.ts             # API 请求解析 (必须使用)
│   ├── errorHandler.ts           # 错误处理 (ErrorHandler)
│   ├── cookies.ts / jwt.ts       # Cookie/JWT 处理
│   ├── time.ts / formatDistanceToNow.ts # 时间处理
│   ├── formatNumber.ts           # 数字格式化
│   ├── device.ts                 # 设备检测
│   ├── router.ts                 # 路由工具
│   ├── validate.ts               # 通用验证正则
│   ├── algorithm.ts              # 密码 Hash (Argon2id)
│   ├── processComments.ts        # 评论处理
│   ├── trackingUtils.ts          # 埋点工具
│   └── actions/
│       ├── verifyHeaderCookie.ts  # Cookie 验证 (Server Action)
│       └── safeParseSchema.ts     # Schema 安全解析
├── middleware/
│   └── auth.ts                   # 认证中间件
├── middleware.ts                  # Next.js 中间件入口
└── styles/
    ├── index.css                 # 全局样式入口
    ├── tailwind.css              # Tailwind 配置 + HeroUI 插件
    ├── hero.ts                   # HeroUI Tailwind 插件导出
    ├── blog.css                  # 代码高亮变量
    ├── prose.css                 # 文档排版样式
    └── editor.css                # Milkdown 编辑器样式
```

## 八、HTTP 请求规范 (强制)

### 8.1 客户端请求 — 必须使用 `@/utils/fetch.ts`

```tsx
import {
  FetchGet,
  FetchPost,
  FetchPut,
  FetchDelete,
  FetchFormData
} from '@/utils/fetch'

// GET
const data = await FetchGet<ResponseType>('/admin/resource', {
  page: 1,
  limit: 10
})

// POST
const result = await FetchPost<ResponseType>('/admin/resource', { name: 'xxx' })

// PUT
const updated = await FetchPut<ResponseType>('/admin/resource', {
  id: 1,
  name: 'new'
})

// DELETE
const deleted = await FetchDelete<ResponseType>('/admin/resource', { id: 1 })

// FormData (文件上传)
const uploaded = await FetchFormData<ResponseType>('/upload', formData)
```

**禁止**: `fetch()`, `axios`, 或其他 HTTP 库。

### 8.2 错误处理 — 使用 `ErrorHandler`

```tsx
import { ErrorHandler } from '@/utils/errorHandler'

const res = await FetchPost<UserState>('/auth/login', data)
ErrorHandler(res, (value) => {
  // 成功处理
  setUser(value)
  addToast({ title: '成功', description: '登录成功!', color: 'success' })
})
```

## 九、API 路由规范 (强制)

### 9.1 请求解析 — 必须使用 `@/utils/parseQuery.ts` + Zod

```tsx
import {
  ParseGetQuery,
  ParsePostBody,
  ParsePutBody,
  ParseDeleteQuery,
  ParseFormData
} from '@/utils/parseQuery'
```

### 9.2 API 文件结构

```
src/app/api/[domain]/[resource]/
├── route.ts        # 入口文件
├── get.ts          # GET 业务逻辑
├── create.ts       # POST 业务逻辑
├── update.ts       # PUT 业务逻辑
├── delete.ts       # DELETE 业务逻辑
└── [子功能]/
```

### 9.3 route.ts 模板

```tsx
import { NextRequest, NextResponse } from 'next/server'
import { ParseGetQuery, ParsePostBody } from '@/utils/parseQuery'
import { getResourceSchema, createResourceSchema } from '@/validations/xxx'
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'
import { getResource } from './get'
import { createResource } from './create'

export async function GET(req: NextRequest) {
  const input = ParseGetQuery(req, getResourceSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await getResource(input)
  return NextResponse.json(res)
}

export async function POST(req: NextRequest) {
  const input = await ParsePostBody(req, createResourceSchema)
  if (typeof input === 'string') {
    return NextResponse.json(input)
  }

  const payload = await verifyHeaderCookie()
  if (!payload) {
    return NextResponse.json('用户未登录')
  }

  const res = await createResource(input)
  return NextResponse.json(res)
}
```

### 9.4 业务逻辑文件模板

```tsx
import { z } from 'zod'
import { prisma } from '@/../prisma'
import { getResourceSchema } from '@/validations/xxx'

export const getResource = async (input: z.infer<typeof getResourceSchema>) => {
  try {
    const data = await prisma.resource.findMany({
      /* ... */
    })
    return { success: true, data }
  } catch (error) {
    console.error('获取资源失败:', error)
    return error instanceof Error ? error.message : '获取资源时发生未知错误'
  }
}
```

## 十、Zod Schema 验证规范

### 10.1 文件位置: `src/validations/`

### 10.2 命名: `[模块名][操作][目标]Schema`

```tsx
import { z } from 'zod'

// 分页查询
export const adminGetResourceSchema = z.object({
  page: z.coerce.number().min(1).max(9999999),
  limit: z.coerce.number().min(1).max(100),
  search: z.string().max(300).optional(),
  sortField: z.enum(['created', 'updated', 'view']).default('updated'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// 创建
export const adminCreateResourceSchema = z.object({
  name: z.string().trim().min(1, { message: '名称不能为空' }),
  dbId: z.string().trim().min(1, { message: 'DBID不能为空' })
})

// 删除
export const adminDeleteResourceSchema = z.object({
  id: z.coerce.number().min(1).max(9999999)
})
```

## 十一、类型定义规范

| 用途           | 位置                      | 格式     |
| -------------- | ------------------------- | -------- |
| API 响应类型   | `src/types/api/*.d.ts`    | 声明文件 |
| 客户端组件类型 | `src/types/common/*.d.ts` | 声明文件 |
| 全局类型       | `src/types/*.d.ts`        | 声明文件 |

```tsx
// ✅ 正确：从 types 目录导入
import type { AdminResource } from '@/types/api/admin'
import type { HomeCarousel } from '@/types/common/home'

// ❌ 错误：在组件中定义复杂类型
```

## 十二、状态管理 (Zustand)

### 12.1 标准 Store

```tsx
import { create } from 'zustand'

export interface XXXState {
  /* ... */
}
export interface XXXStore extends XXXState {
  /* actions */
}

export const useXXXStore = create<XXXStore>()((set) => ({
  // state + actions
}))
```

### 12.2 持久化 Store

```tsx
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      /* ... */
    }),
    { name: 'user-store', storage: createJSONStorage(() => localStorage) }
  )
)
```

### 12.3 已有 Store

| Store                | 用途                     |
| -------------------- | ------------------------ |
| `globalStore`        | 设备信息、Hydration 状态 |
| `userStore`          | 用户认证信息 (persist)   |
| `searchStore`        | 搜索历史、筛选条件       |
| `editStore`          | 编辑表单数据             |
| `adminResourceStore` | 管理端资源状态           |
| `trackingStore`      | 埋点事件队列             |
| `adminTrackingStore` | 管理端埋点数据           |

## 十三、组件编写规范

### 13.1 组件模板

```tsx
'use client'

import { useState } from 'react'

import { Button, Card, CardBody } from '@heroui/react'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { SomeType } from '@/types/api/xxx'

interface ComponentNameProps {
  title: string
  isActive?: boolean
  onAction?: () => void
  className?: string
}

export const ComponentName = ({
  title,
  isActive = false,
  onAction,
  className
}: ComponentNameProps) => {
  const [state, setState] = useState(false)

  const handleClick = () => {
    onAction?.()
  }

  return (
    <Card className={cn('base-classes', className)}>
      <CardBody>
        <Button onPress={handleClick}>{title}</Button>
      </CardBody>
    </Card>
  )
}
```

### 13.2 表单组件 (React Hook Form + HeroUI)

```tsx
'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addToast, Button, Input } from '@heroui/react'
import { z } from 'zod'
import { someSchema } from '@/validations/xxx'

type FormData = z.infer<typeof someSchema>

export const SomeForm = () => {
  const { control, watch } = useForm<FormData>({
    resolver: zodResolver(someSchema),
    defaultValues: { name: '' }
  })

  return (
    <form>
      <Controller
        name="name"
        control={control}
        render={({ field, formState: { errors } }) => (
          <Input
            {...field}
            isRequired
            label="名称"
            variant="bordered"
            isInvalid={!!errors.name}
            errorMessage={errors.name?.message}
          />
        )}
      />
    </form>
  )
}
```

## 十四、样式规范

### 14.1 Tailwind CSS

- 优先使用 Tailwind 工具类
- 复杂样式合并使用 `cn()` (`@/lib/utils`)
- 响应式：移动优先 (`sm:` → `md:` → `lg:` → `xl:`)
- 暗黑模式：使用语义化 token (`text-default-800`, `bg-content1`, `text-primary`)

### 14.2 主题

- 通过 `next-themes` + `ThemeProvider` 管理
- 自定义主色: `rgb(14 165 233)` (天蓝色)
- HeroUI 提供 `default`, `primary`, `secondary`, `success`, `warning`, `danger` 语义色

### 14.3 容器

```tsx
// 标准容器：自动响应式宽度
<div className="container mx-auto">
```

容器断点: 1280px → 1400px → 1600px → 1760px → 1920px

## 十五、认证与权限

### 15.1 中间件保护路由

```
matcher: ['/admin/:path*', '/user/:path*', '/edit/:path*']
```

### 15.2 Cookie: `12club-token`

### 15.3 角色权限

| role | 角色       | 权限          |
| ---- | ---------- | ------------- |
| 1    | 用户       | 基础功能      |
| 2    | 创作者     | 上传/编辑资源 |
| 3    | 管理员     | 管理面板      |
| 4    | 超级管理员 | 全部权限      |

### 15.4 API 端验证

```tsx
import { verifyHeaderCookie } from '@/utils/actions/verifyHeaderCookie'

const payload = await verifyHeaderCookie()
if (!payload) {
  return NextResponse.json('用户未登录')
}
// payload: { uid, name, role, iss, aud }
```

## 十六、数据模型 (Prisma)

### 核心模型

| 模型                                        | 说明                                                   |
| ------------------------------------------- | ------------------------------------------------------ |
| `User`                                      | 用户 (name, email, password, role, avatar, bio)        |
| `Resource`                                  | 资源 (name, db_id, type[], language[], view, download) |
| `ResourceAlias`                             | 资源别名                                               |
| `ResourceTag` / `ResourceTagRelation`       | 标签系统                                               |
| `ResourcePatch`                             | 下载资源补丁                                           |
| `ResourceComment`                           | 评论 (支持嵌套回复)                                    |
| `ResourcePlayLink`                          | 播放链接                                               |
| `ResourceAutoUpdate`                        | 自动更新配置                                           |
| `ResourceSeries` / `ResourceSeriesRelation` | 系列管理                                               |
| `UserFollowRelation`                        | 关注关系                                               |
| `UserMessage`                               | 站内消息                                               |
| `UserResourceFavoriteRelation`              | 收藏关系                                               |
| `UserResourceFavoriteFolder`                | 收藏夹                                                 |
| `UserResourceCommentLikeRelation`           | 评论点赞                                               |
| `Announcement`                              | 公告                                                   |
| `PasswordReset`                             | 密码重置                                               |
| `TrackingVisitor` / `TrackingEvent`         | 埋点系统                                               |

### Prisma Client 导入

```tsx
import { prisma } from '@/../prisma'
```

## 十七、路由 & 导航

### 17.1 路由器使用

```tsx
// 带进度条导航
import { useRouter } from 'next-nprogress-bar'

// 带 View Transition 动画导航
import { useTransitionRouter } from 'next-view-transitions'
import { slideInOut, upPage } from '@/lib/routerTransition'

router.push(href, { onTransitionReady: slideInOut })
```

### 17.2 资源路由映射

| 前缀 | 路由      | 类型 |
| ---- | --------- | ---- |
| `a`  | `/anime/` | 动漫 |
| `c`  | `/comic/` | 漫画 |
| `g`  | `/game/`  | 游戏 |
| `n`  | `/novel/` | 小说 |

```tsx
import { getRouteByDbId } from '@/utils/router'
// getRouteByDbId('a12345') → '/anime/a12345'
```

## 十八、新功能开发检查清单

### 新增 API

- [ ] `src/validations/` 添加 Zod Schema
- [ ] `src/types/api/` 添加响应类型
- [ ] 创建 `route.ts` 入口文件
- [ ] GET/POST/PUT/DELETE 抽离为独立文件
- [ ] 使用 `ParseXXX` 解析请求
- [ ] 使用 `verifyHeaderCookie` 验证身份

### 新增页面

- [ ] `src/app/[模块]/page.tsx`
- [ ] 需要时创建 `layout.tsx` 和 `actions.ts`
- [ ] 动态路由使用 `[id]/`

### 新增组件

- [ ] UI 组件 → `components/ui/`
- [ ] 公共组件 → `components/common/`
- [ ] 容器组件 → `components/[模块]Container/`，入口 `index.tsx`

### 新增状态

- [ ] `src/store/[模块]Store.ts`

### 新增工具

- [ ] 第三方集成 → `src/lib/`
- [ ] 纯工具函数 → `src/utils/`

### 新增常量

- [ ] `src/constants/[模块].ts`

### 新增配置

- [ ] `src/config/[模块].ts`
