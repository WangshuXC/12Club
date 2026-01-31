# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 项目概述

12Club 是一个专为南开大学 ACG（动画、漫画、轻小说）爱好者打造的综合性资源分享平台。项目基于 Next.js 15 App Router 构建，提供动漫在线观看、音乐播放、资源下载、用户社区等功能，致力于创建一个活跃的 ACG 文化交流社区。

**核心技术栈**: Next.js 15 + React 19 + TypeScript + Prisma + PostgreSQL + Redis + AWS S3

## 常用开发命令

### 开发与构建
- `npm run dev` - 启动开发服务器，使用 Turbopack 加速构建，运行在端口 9001
- `npm run build` - 生产环境构建，集成 PM2 进程管理，自动停止旧进程并启动新进程
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 代码检查
- `npm run format` - 使用 Prettier 格式化所有代码文件

### 数据库管理
- `npm run prisma:generate` - 生成 Prisma 客户端，在依赖变更后自动执行
- `npm run prisma:push` - 推送数据库模式变更到数据库
- `npm run prisma:migrate` - 创建和应用数据库迁移
- `npm run prisma:studio` - 打开 Prisma Studio 可视化数据库管理界面

## 高层架构和结构

### 整体架构模式

12Club 采用现代化的全栈 Next.js 架构，遵循关注点分离和模块化设计原则：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   客户端 (React) │ ←→ │  API Routes     │ ←→ │  数据层 (Prisma) │
│   - 组件         │    │  - 认证         │    │  - PostgreSQL   │
│   - 状态管理     │    │  - 业务逻辑     │    │  - Redis 缓存   │
│   - 路由         │    │  - 数据验证     │    │  - S3 存储      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 核心技术栈详解

**前端层**:
- **Next.js 15**: App Router 架构，支持 SSR/SSG，Turbopack 开发加速
- **React 19**: 最新特性支持，包括并发渲染和 Suspense
- **TypeScript 5.9**: 严格类型检查，路径别名 `@/*` 指向 `src/*`
- **Zustand 5.0**: 轻量级状态管理，支持持久化和 SSR 同步
- **HeroUI 2.8**: 现代化 UI 组件库，支持主题切换和响应式设计

**样式系统**:
- **Tailwind CSS 4.1**: 原子化 CSS，支持暗黑模式和自定义主题
- **Framer Motion**: 页面转场动画和交互动效
- **Sass 1.84**: CSS 预处理器，用于复杂样式逻辑

**数据层**:
- **Prisma 6.12**: 类型安全的 ORM，支持 PostgreSQL 和 Prisma Accelerate
- **PostgreSQL**: 主数据库，存储用户、资源、评论等核心数据
- **Redis**: 缓存层，提升热点数据访问性能
- **AWS S3**: 文件存储，处理图片、视频等媒体资源

### 目录结构与职责

```
src/
├── app/                    # Next.js App Router 页面路由
│   ├── api/               # API 路由处理器
│   │   ├── auth/          # 用户认证相关 API
│   │   ├── admin/         # 管理员功能 API (37个端点)
│   │   ├── user/          # 用户相关 API (17个端点)
│   │   └── detail/        # 资源详情 API (12个端点)
│   ├── admin/             # 管理后台页面
│   ├── user/              # 用户中心页面
│   ├── anime|comic|game|novel/ # 各类资源详情页
│   └── layout.tsx         # 根布局，集成全局提供者
├── components/            # React 组件库
│   ├── ui/               # 基础 UI 组件 (shadcn/ui 风格)
│   ├── common/           # 通用组件 (导航、页脚等)
│   ├── topBar/           # 顶部导航栏组件
│   ├── HomeContainer/    # 首页容器组件
│   └── admin/            # 管理员专用组件
├── lib/                  # 核心工具库
│   ├── redis.ts          # Redis 缓存操作封装
│   ├── s3.ts            # AWS S3 文件存储操作
│   └── utils.ts         # 通用工具函数 (Tailwind 合并等)
├── store/               # Zustand 状态管理
│   ├── userStore.ts     # 用户状态 (认证、个人信息)
│   ├── searchStore.ts   # 搜索状态 (历史、筛选)
│   └── editStore.ts     # 编辑状态 (表单数据)
├── utils/               # 工具函数集合
│   ├── fetch.ts         # 统一 HTTP 客户端封装
│   └── parseQuery.ts    # 服务端请求解析工具
├── middleware/          # Next.js 中间件
│   └── auth.ts          # 路由保护和认证逻辑
└── types/               # TypeScript 类型定义
    ├── api/             # API 响应类型
    └── common/          # 通用类型定义
```

### 数据模型与关系

核心数据模型围绕 **用户** 和 **资源** 构建，支持完整的社区功能：

**用户系统**:
- `User`: 用户基础信息，支持角色权限 (role: 1=普通用户, 2+=管理员)
- `UserFollowRelation`: 用户关注关系，构建社交网络
- `UserMessage`: 站内消息系统，支持反馈和回复

**资源系统**:
- `Resource`: 核心资源模型，支持多语言和多类型标记
- `ResourcePatch`: 资源更新补丁，版本化管理
- `ResourceTag`: 标签系统，支持别名和分类
- `ResourceComment`: 评论系统，支持嵌套回复和点赞
- `ResourcePlayLink`: 播放链接管理，支持多集内容

**高级功能**:
- `UserResourceFavoriteFolder`: 收藏夹系统，支持分类管理
- `ResourceAutoUpdate`: 自动更新机制，定时同步资源
- `Announcement`: 公告系统，管理员发布通知

### 认证与权限架构

**认证流程**:
1. JWT Token 存储在 Cookie (`12club-token`)
2. 中间件拦截保护路由 (`/admin/*`, `/user/*`, `/edit/*`)
3. 基于角色的权限控制 (RBAC)
4. 自动重定向未认证用户到登录页

**权限层级**:
- **游客**: 浏览公开内容
- **普通用户** (role=1): 上传资源、评论、收藏
- **管理员** (role≥2): 管理用户、审核内容、系统配置

### API 设计模式

**统一请求处理**:
- 客户端必须使用 `@/utils/fetch.ts` 封装的方法 (`FetchGet`, `FetchPost`, `FetchPut`, `FetchDelete`, `FetchFormData`)
- 服务端必须使用 `@/utils/parseQuery.ts` 配合 Zod Schema 验证请求数据
- 自动处理开发/生产环境 API 地址切换
- 集成错误处理和类型安全

**数据流模式**:
```
客户端组件 → Zustand Store → Fetch Utils → API Routes → Prisma ORM → PostgreSQL
                                                     ↓
                                               Redis 缓存 ← → S3 存储
```

### 性能优化策略

**缓存层次**:
- **Redis**: 热点数据缓存 (用户会话、资源统计)
- **Next.js**: 页面级缓存和 ISR
- **浏览器**: 静态资源缓存和 Service Worker

**代码分割**:
- 路由级别的动态导入
- 组件懒加载 (`React.lazy`)
- 第三方库按需导入

**媒体优化**:
- Next.js Image 组件自动优化
- Sharp 图片处理和压缩
- S3 CDN 加速静态资源

### 开发规范集成

项目包含详细的开发规范文件 (`.cursorrules`)，涵盖：
- **代码格式**: Prettier 配置 (单引号、无分号、2空格缩进)
- **ESLint 规则**: 严格的代码质量检查
- **命名约定**: PascalCase 组件、camelCase 变量、kebab-case 类型文件
- **API 规范**: 统一的请求/响应处理模式
- **安全规范**: 数据验证、认证授权、错误处理

### 部署与运维

**生产环境**:
- PM2 进程管理，支持零停机部署
- PostgreSQL 数据库持久化
- Redis 缓存集群
- AWS S3 文件存储和 CDN

**监控集成**:
- Umami 网站分析
- 错误日志收集
- 性能监控和告警

这个架构设计确保了项目的可扩展性、可维护性和高性能，为 ACG 社区提供了稳定可靠的技术基础。