# 前端埋点事件字典

本文档描述当前站点实际发送到 `POST /api/tracking` 的事件。登录和注册流程**不在本次埋点范围内**；本次新增的业务事件均不记录密码、搜索原文、评论原文、反馈原文或下载链接。

## 通用事件结构

每条事件都包含以下通用字段；`extra_data` 中的字段以事件表为准。

| 字段                                   | 来源         | 说明                                                       |
| -------------------------------------- | ------------ | ---------------------------------------------------------- |
| `event_type`                           | 前端         | `expose`、`click` 或 `custom`。                            |
| `event_name`                           | 前端         | 事件名称。                                                 |
| `page_url` / `page_title` / `referrer` | 前端         | 当前页面、标题和来源页。                                   |
| `viewport` / `screen` / `device_type`  | 前端         | 视口、屏幕分辨率和 `desktop` / `mobile` / `tablet`。       |
| `session_id` / `timestamp`             | 前端         | 单次页面会话 ID 和客户端产生时间。                         |
| `visitor_id` / `user_id`               | 服务端       | 由 GUID 和当前登录态关联；匿名访问的 `user_id` 为 `null`。 |
| `user_agent` / `ip`                    | 服务端访客表 | 用于访客与设备汇总，不放入 `extra_data`。                  |

`data-log-foo-bar` 会自动规范化为 `extra_data.foo_bar`，避免前端 DOM 属性的连字符影响查询口径。

## 页面与内容发现

| 事件名                 | 类型     | 触发时机                                              | `extra_data`                                                                                                 |
| ---------------------- | -------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `page_view`            | `custom` | 首次进入页面、Next 路由或查询参数变化后               | `device_type`、`source`、`screen_width`、`screen_height`、`viewport_width`、`viewport_height`、`language`    |
| `resource_card_expose` | `expose` | 资源卡片进入视口（同一 DOM 节点每个页面周期至多一次） | `db_id`、`resource_type`（dbId 首字符）、`surface`、`position`、`element_id`、`element_tag`、`element_class` |
| `resource_card_click`  | `click`  | 点击资源卡片并进入详情                                | `db_id`、`resource_type`、`surface`、`position`、`click_x`、`click_y`                                        |
| `resource_detail_view` | `custom` | 打开资源详情页                                        | `dbid`、`resource_type`                                                                                      |

`surface` 当前取值包括 `home_latest`、`search`、`catalog_{category}`；`position` 为该展示面从 1 开始的排序位置。

## 搜索、目录与筛选

| 事件名                        | 类型     | 触发时机                   | `extra_data`                                                                                                                                             |
| ----------------------------- | -------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `search_submit`               | `custom` | 防抖搜索请求发出           | `query_length`、`page`、`search_in_introduction`、`search_in_alias`、`resource_types`、`selected_type`、`sort_field`、`sort_order`、`language`、`status` |
| `search_result`               | `custom` | 搜索接口返回结果后         | `search_submit` 的全部字段加 `result_count`                                                                                                              |
| `search_pagination_change`    | `custom` | 搜索结果切页               | `page`                                                                                                                                                   |
| `catalog_sort_change`         | `custom` | 目录页切换排序字段或升降序 | `category`、`sort_field`、`sort_order`                                                                                                                   |
| `catalog_filter_panel_toggle` | `custom` | 打开或收起目录高级筛选     | `category`、`opened`                                                                                                                                     |
| `catalog_filter_apply`        | `custom` | 修改语言或完结状态筛选     | `category`、`filter_name`、`filter_value`                                                                                                                |
| `catalog_filter_reset`        | `custom` | 重置目录筛选               | `category`                                                                                                                                               |
| `catalog_pagination_change`   | `custom` | 目录页切页                 | `category`、`page`                                                                                                                                       |

搜索只记录 `query_length`，不记录关键词本身；这样可以分析零结果率、筛选使用率和搜索转化，而不保留用户输入内容。

## 播放与分集

| 事件名                      | 类型     | 触发时机                              | `extra_data`                                        |
| --------------------------- | -------- | ------------------------------------- | --------------------------------------------------- |
| `accordion-play`            | `custom` | 某集视频首次真正开始播放              | `dbid`、`accordion`、`name`                         |
| `episode_select`            | `custom` | 用户手动切换播放集数                  | `dbid`、`episode`、`previous_episode`               |
| `play_progress`             | `custom` | 播放首次跨越 25%、50%、75% 任一进度桶 | `dbid`、`episode`、`progress`（`25` / `50` / `75`） |
| `play_complete`             | `custom` | 视频播放结束                          | `dbid`、`episode`                                   |
| `play_error`                | `custom` | 视频元素产生错误                      | `dbid`、`episode`                                   |
| `playlist_view_mode_change` | `custom` | 分集列表在宫格/列表视图间切换         | `dbid`、`view_mode`（`grid` / `list`）              |
| `playlist_sort_change`      | `custom` | 分集列表升降序切换                    | `dbid`、`sort_order`（`asc` / `desc`）              |
| `anime_detail_tab_change`   | `custom` | 动画详情的“分集选择/下载资源”标签切换 | `dbid`、`tab`                                       |

`accordion-play` 是现有看板已经使用的兼容事件名，语义等同于“播放开始”。进度事件按桶去重，每个播放器实例最多发送三条，不会逐秒上报。

## 下载与资源贡献

| 事件名                       | 类型     | 触发时机                                   | `extra_data`                                               |
| ---------------------------- | -------- | ------------------------------------------ | ---------------------------------------------------------- |
| `official_download_click`    | `custom` | 点击官方分集下载                           | `dbid`、`episode`                                          |
| `download_reveal`            | `custom` | 展开一条个人资源的下载链接                 | `dbid`、`patch_id`、`storage`                              |
| `download_link_click`        | `custom` | 点击个人资源的某个外部下载链接             | `dbid`、`patch_id`、`storage`、`link_index`                |
| `download_view_mode_change`  | `custom` | 动画下载分集在宫格/列表视图间切换          | `dbid`、`view_mode`                                        |
| `download_sort_change`       | `custom` | 动画下载分集升降序切换                     | `dbid`、`sort_order`                                       |
| `resource_publish_open`      | `custom` | 打开“添加资源”弹窗                         | `dbid`                                                     |
| `resource_detail_tab_change` | `custom` | 普通详情页切换标签，或从操作栏跳到下载资源 | `dbid`、`tab`，从操作栏进入时额外有 `source: "action_bar"` |

`download_reveal` 与 `download_link_click` 需分开使用：前者衡量资源被查看，后者才表示用户有下载意图。只记录链接序号 `link_index`，不记录真实下载 URL。

## 互动

| 事件名                   | 类型     | 触发时机                   | `extra_data`                                      |
| ------------------------ | -------- | -------------------------- | ------------------------------------------------- |
| `favorite_open`          | `custom` | 已登录用户打开收藏夹选择框 | `dbid`                                            |
| `favorite_success`       | `custom` | 收藏或取消收藏接口成功     | `dbid`、`folder_id`、`action`（`add` / `remove`） |
| `share_copy`             | `custom` | 复制资源分享链接           | `dbid`、`method`（当前为 `link`）                 |
| `feedback_open`          | `custom` | 打开资源反馈弹窗           | `dbid`                                            |
| `feedback_submit`        | `custom` | 反馈提交请求完成           | `dbid`、`content_length`                          |
| `comment_section_open`   | `custom` | 在动画详情中定位到评论区   | `dbid`                                            |
| `comment_submit_success` | `custom` | 评论发布成功               | `dbid`、`is_reply`、`content_length`              |
| `comment_submit_fail`    | `custom` | 评论请求发生异常           | `dbid`、`is_reply`、`reason`                      |
| `comment_like_success`   | `custom` | 评论点赞或取消点赞成功     | `comment_id`、`action`（`like` / `unlike`）       |

互动事件不上传评论、反馈的文本，只上传长度、回复关系和接口结果，便于计算参与率且不扩大内容数据的访问面。

## 查询与看板使用建议

- 播放访客、播放次数继续以 `accordion-play` 统计；完成率使用 `play_complete / accordion-play`，中途观看深度可按 `play_progress.progress` 分桶。
- 资源卡片 CTR 使用 `resource_card_click / resource_card_expose`，建议按 `surface`、`position`、`resource_type` 分组。
- 搜索体验用 `search_result.result_count = 0` 计算零结果率；不要通过搜索词还原用户输入。
- 下载漏斗使用 `download_reveal → download_link_click`，并按 `storage` 和 `link_index` 观察链接质量。
- 所有比例指标应按相同时间范围、相同访客去重口径计算；不要把事件次数直接当作独立用户数。
