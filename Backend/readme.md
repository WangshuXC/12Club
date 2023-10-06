## 文件结构

> project/
> ├── app/
> │ ├── \_\_init\_\_.py
> │ ├── models.py # 数据库模型定义
> │ ├── routes/ # 路由相关
> │ │ ├── \_\_init\_\_.py
> │ │ ├── anime_routes.py # 动漫页路由
> │ │ ├── comic_routes.py # 漫画页路由
> │ │ ├── novel_routes.py # 小说页路由
> │ │ └── admin_routes.py # 管理员页面路由
> │ ├── templates/ # HTML 模板文件
> │ └── static/ # 静态资源文件
> ├── migrations/ # 数据库迁移文件
> ├── config.py # 配置文件
> └── run.py # 项目入口文件
