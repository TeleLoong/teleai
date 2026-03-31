# TeleAI_weai 网站维护手册

这份文档是当前 TeleAI 涉水具身智能团队网站的日常维护说明。

这个网站基于 [al-folio](https://github.com/alshedivat/al-folio) 和 Jekyll 搭建。你不需要先学会 Jekyll 才能改内容，只要先搞清楚下面 4 个原则：

1. 大多数文字、图片、视频入口都在 [`_pages/`](_pages/)。
2. 页面长什么样主要由 [`_layouts/`](_layouts/) 和 [`_includes/`](_includes/) 控制。
3. 页面样式主要在 [`_sass/`](_sass/)。
4. 图片、视频等素材主要放在 [`assets/`](assets/)。

如果你只是在改文案、换图、加视频、更新成员或论文，通常不需要改 Liquid 模板代码。

## 维护前先知道

### 这些词是什么意思

- **Markdown**：一种比 Word 更接近纯文本的写法，适合写页面正文。
- **front matter**：文件顶部两行 `---` 之间的配置区，用来告诉网站标题、导航顺序、图片路径等信息。
- **YAML**：front matter 里使用的配置格式，特点是冒号和缩进很重要。
- **Liquid**：Jekyll 的模板语言。只有在你要改页面结构时，才需要碰它。
- **SCSS**：样式源码。要改页面颜色、间距、卡片大小等，通常去 [`_sass/`](_sass/)。

### 最常用的几个目录

| 目录 / 文件                  | 用途                   | 维护时最常见的操作                       |
| ---------------------------- | ---------------------- | ---------------------------------------- |
| [`_pages/`](_pages/)         | 当前网站的页面内容入口 | 改文字、改字段、改图片路径、改导航顺序   |
| [`_layouts/`](_layouts/)     | 页面整体结构模板       | 改页面布局、模块顺序、渲染逻辑           |
| [`_includes/`](_includes/)   | 页面局部组件           | 改卡片结构、列表结构、局部展示逻辑       |
| [`_sass/`](_sass/)           | 页面样式源码           | 改字体、颜色、间距、卡片尺寸、响应式布局 |
| [`assets/`](assets/)         | 所有静态素材           | 存图片、视频、二维码、封面图             |
| [`_config.yml`](_config.yml) | 全站设置               | 改站点标题、域名、`baseurl`、功能开关    |
| [`_site/`](_site/)           | 网站编译后的输出目录   | **不要手动编辑**                         |

### 日常维护的判断方法

- 要改“页面内容”时，先看 [`_pages/`](_pages/)。
- 要改“页面长相”时，先看 [`_sass/`](_sass/)。
- 要改“页面结构”时，先看 [`_layouts/`](_layouts/)。
- 要改“某一小块卡片或组件”时，先看 [`_includes/`](_includes/)。
- 如果不确定，先从对应页面的 `layout:` 字段往下查。

### 不要优先改这些地方

下面这些文件或目录容易误导新维护者，当前网站日常维护一般不靠它们：

- [`_site/`](_site/)：编译结果，刷新构建后会被覆盖。
- [`_data/team.yml`](_data/team.yml)：旧的团队数据入口，不是当前团队页的主要来源。
- [`_data/equipment_gallery.yml`](_data/equipment_gallery.yml)：旧的设备数据入口，不是当前设备页的主要来源。
- [`_layouts/home_lab.liquid`](_layouts/home_lab.liquid)：旧首页模板，当前首页不是用它渲染的。

## 一次完整维护流程

下面是最常用、最稳妥的一次完整更新流程。建议每次都按这个顺序来。

### 1. 先拉最新代码

```bash
git pull origin main
```

这样可以避免你在旧代码基础上修改，减少冲突。

### 2. 修改页面和素材

常见情况：

- 改文字：修改 [`_pages/`](./_pages/)
- 换图片：把图片放进 [`assets/`](assets/) 后，再修改页面里的路径
- 换视频：把视频放进对应素材目录后，再修改页面里的路径
- 改样式：修改 [`_sass/`](./_sass/)

### 3. 本地预览网站

```bash
docker compose up
```

然后在浏览器打开：

```text
http://localhost:8080
```

检查内容是否正常显示，尤其要看：

- 导航是否正常
- 图片是否能加载
- 视频是否能播放
- 移动端大致是否正常

停止预览的方法：

```bash
docker compose down
```

如果你是用前台运行的 `docker compose up`，也可以直接按 `Ctrl + C`。

### 4. 查看本次改了哪些文件

```bash
git status
```

确认只包含你想提交的文件。

### 5. 显式添加要提交的文件

仓库规范不建议直接用 `git add .`。请明确写出文件名。

```bash
git add _pages/team.md assets/team/new-member.jpg
```

如果你改了多个文件，就把它们都写上。

### 6. 提交修改

提交信息建议使用仓库约定格式：

```text
<type>: <subject>
```

常见 `type`：

- `feat`：新增内容或新功能
- `fix`：修正错误
- `docs`：文档修改
- `style`：样式调整
- `config`：配置修改
- `chore`：杂项维护

示例：

```bash
git commit -m "feat: update team page members"
git commit -m "fix: refresh contact page address"
git commit -m "style: adjust publications card spacing"
```

### 7. 推送到 GitHub

```bash
git push origin main
```

推送成功后，如果你修改的是网站相关文件（例如 `_pages/`、`assets/`、`_sass/`、`_layouts/`），GitHub Actions 会自动部署网站。通常几分钟后生效。

如果 `git push` 失败：

- 先不要强推。
- 先执行 `git pull origin main`。
- 如果出现冲突，建议找熟悉 Git 的同事一起处理。

### 8. 推荐但不是强制的额外检查

如果你做了较多 Markdown 或文档修改，建议运行：

```bash
npx prettier README.md --write
```

如果你做了整站内容调整，建议在提交前运行：

```bash
npx prettier . --write
```

## 网站目录地图

下面这张表可以帮助你快速判断“我应该去哪改”。

| 我想改什么                                   | 优先去哪里                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| 页面标题、正文、卡片内容、图片路径、视频路径 | [`_pages/`](./_pages/)                                                   |
| 页面结构、模块顺序、渲染逻辑                 | [`_layouts/`](./_layouts/)                                               |
| 卡片、小组件、局部模板                       | [`_includes/`](./_includes/)                                             |
| 颜色、字体、间距、布局                       | [`_sass/`](./_sass/)                                                     |
| 全站标题、域名、`baseurl`                    | [`_config.yml`](_config.yml)                                             |
| 首页普通图片                                 | [`assets/img/`](assets/img/)                                             |
| 团队头像                                     | [`assets/team/`](assets/team/)                                           |
| 设备页图片                                   | [`assets/equipment/`](assets/equipment/)                                 |
| 研究成果视频与封面                           | [`assets/publication/`](assets/publication/)                             |
| 论文预览图                                   | [`assets/img/publication_preview/`](assets/img/publication_preview/)     |
| 报道视频与截图                               | [`assets/reports/`](assets/reports/)                                     |
| 首页概览视频                                 | [`assets/mp4/`](assets/mp4/)                                             |
| 首页概览海报图                               | [`assets/img/home-overview-posters/`](assets/img/home-overview-posters/) |

> 建议新增素材时统一使用 `/assets/...` 这种绝对路径写法。仓库里有少量旧字段写成 `assets/...`，虽然也能工作，但新内容最好统一。

## 页面维护总表

如果你只想先知道“页面地址对应哪个文件”，先看这张表。

| 页面     | 页面地址         | 主要内容文件                                       | 结构文件                                                       | 样式 / 脚本                                                                                                                  | 素材目录                                                                                                                             |
| -------- | ---------------- | -------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 首页     | `/`              | [`_pages/home.md`](_pages/home.md)                 | [`_layouts/home.liquid`](_layouts/home.liquid)                 | [`_sass/_home.scss`](_sass/_home.scss), [`assets/js/home-overview-video.js`](assets/js/home-overview-video.js)               | [`assets/img/`](assets/img/), [`assets/mp4/`](assets/mp4/), [`assets/img/home-overview-posters/`](assets/img/home-overview-posters/) |
| 团队页   | `/team/`         | [`_pages/team.md`](_pages/team.md)                 | [`_layouts/team.liquid`](_layouts/team.liquid)                 | [`_includes/team/member_card.liquid`](_includes/team/member_card.liquid), [`_sass/_team.scss`](_sass/_team.scss)             | [`assets/team/`](assets/team/)                                                                                                       |
| 研究方向 | `/research/`     | [`_pages/research.md`](_pages/research.md)         | [`_layouts/research.liquid`](_layouts/research.liquid)         | [`_sass/_research.scss`](_sass/_research.scss)                                                                               | [`assets/img/`](assets/img/), [`assets/publication/`](assets/publication/)                                                           |
| 研究成果 | `/publications/` | [`_pages/publications.md`](_pages/publications.md) | [`_layouts/publications.liquid`](_layouts/publications.liquid) | [`_sass/_publications.scss`](_sass/_publications.scss), [`assets/js/publications-video.js`](assets/js/publications-video.js) | [`assets/publication/`](assets/publication/), [`assets/img/publication_preview/`](assets/img/publication_preview/)                   |
| 相关报道 | `/reports/`      | [`_pages/reports.md`](_pages/reports.md)           | [`_layouts/reports.liquid`](_layouts/reports.liquid)           | [`_sass/_reports.scss`](_sass/_reports.scss), [`assets/js/reports-video.js`](assets/js/reports-video.js)                     | [`assets/reports/`](assets/reports/)                                                                                                 |
| 实验设备 | `/equipment/`    | [`_pages/equipment.md`](_pages/equipment.md)       | [`_layouts/equipment.liquid`](_layouts/equipment.liquid)       | [`_includes/equipment/gallery.liquid`](_includes/equipment/gallery.liquid), [`_sass/_equipment.scss`](_sass/_equipment.scss) | [`assets/equipment/`](assets/equipment/)                                                                                             |
| 加入我们 | `/jobs/`         | [`_pages/jobs.md`](_pages/jobs.md)                 | [`_layouts/jobs.liquid`](_layouts/jobs.liquid)                 | [`_sass/_jobs.scss`](_sass/_jobs.scss)                                                                                       | [`assets/img/`](assets/img/)                                                                                                         |
| 联系方式 | `/contact/`      | [`_pages/contact.md`](_pages/contact.md)           | [`_layouts/page.liquid`](_layouts/page.liquid)                 | 页面内 `_styles`, 通用布局样式                                                                                               | [`assets/img/`](assets/img/)                                                                                                         |

## 每个页面怎么改

### 首页 `/`

**先改哪里**

- 内容主入口：[`_pages/home.md`](_pages/home.md)
- 布局模板：[`_layouts/home.liquid`](_layouts/home.liquid)
- 样式：[`_sass/_home.scss`](_sass/_home.scss)
- 视频交互脚本：[`assets/js/home-overview-video.js`](assets/js/home-overview-video.js)

**常改内容**

- 顶部横幅：`top_banner.image`
- 首页主标题和副标题：`home.hero.title`、`home.hero.tagline`
- 首页介绍文字：`home.hero.intro`
- 首页研究方向卡片：`home.research.cards`
- 首页项目总览图：`home.overview.image`
- 首页概览视频：`home.overview.*`
- 页尾 CTA 按钮：`home.cta.actions`

**素材放哪里**

- 普通图片：[`assets/img/`](assets/img/)
- 首页概览视频：[`assets/mp4/`](assets/mp4/)
- 首页概览海报图：[`assets/img/home-overview-posters/`](assets/img/home-overview-posters/)

**这页最容易踩坑的地方**

- 首页里的团队预览和设备预览，当前会优先从 [`_pages/team.md`](_pages/team.md) 和 [`_pages/equipment.md`](_pages/equipment.md) 自动同步。
- 如果你改了 `home.team` 或 `home.equipment`，但前台没变化，不一定是你改错了，可能是 [`_layouts/home.liquid`](_layouts/home.liquid) 把它覆盖了。
- 当前首页团队预览优先显示团队页里的负责人和前几位老师。
- 当前首页设备预览优先跟随设备页条目顺序；如果首页设备没变化，请检查 [`_pages/equipment.md`](_pages/equipment.md) 的条目顺序。

### 团队页 `/team/`

**先改哪里**

- 内容主入口：[`_pages/team.md`](_pages/team.md)
- 布局模板：[`_layouts/team.liquid`](_layouts/team.liquid)
- 成员卡片结构：[`_includes/team/member_card.liquid`](_includes/team/member_card.liquid)
- 样式：[`_sass/_team.scss`](_sass/_team.scss)

**最常用字段**

- 负责人：`team.lead`
- 全职研究员 / 工程师：`team.groups` 里 `id: teachers`
- 博士生：`team.groups` 里 `id: phd`
- 硕士生：`team.groups` 里 `id: ms`


每位成员常见字段：

- `name`：姓名
- `role`：角色或岗位
- `subtitle`：学校 / 方向 / 简短说明
- `image`：头像路径
- `links`：个人主页、Scholar、GitHub 等链接
- `bio`：个人介绍

**素材放哪里**

- 团队头像推荐放在 [`assets/team/`](assets/team/)

**这页最容易踩坑的地方**

- 当前老师组通常显示头像卡片。
- 当前博士生和硕士生组默认是文字型卡片，不显示头像；即使你给学生加了 `image`，页面也不一定会显示。
- 如果你希望博士或硕士卡片显示头像，需要同时调整 [`_layouts/team.liquid`](_layouts/team.liquid) 和 [`_includes/team/member_card.liquid`](_includes/team/member_card.liquid)。

### 研究方向 `/research/`

**先改哪里**

- 内容主入口：[`_pages/research.md`](_pages/research.md)
- 布局模板：[`_layouts/research.liquid`](_layouts/research.liquid)
- 样式：[`_sass/_research.scss`](_sass/_research.scss)

**常改内容**

- 页面简介：`research.intro`
- 快捷按钮：`research.quicklinks`
- 研究方向卡片：`research.cards`

每张卡片常见字段：

- `title`
- `description`
- `bullets`
- `image`
- `image_alt`
- `image_fit`

**素材放哪里**

- 普通研究图：[`assets/img/`](assets/img/)
- 研究成果封面如果复用现有封面，也可能放在 [`assets/publication/`](assets/publication/)

### 研究成果 `/publications/`

**先改哪里**

- 内容主入口：[`_pages/publications.md`](_pages/publications.md)
- 布局模板：[`_layouts/publications.liquid`](_layouts/publications.liquid)
- 样式：[`_sass/_publications.scss`](_sass/_publications.scss)
- 视频交互脚本：[`assets/js/publications-video.js`](assets/js/publications-video.js)

**常改内容**

- 视频展示：`publications.videos.items`
- 项目文字：`publications.projects.items`
- 论文成果：`publications.records.papers`
- 专利成果：`publications.records.patents`

论文常见字段：

- `title`
- `authors`
- `venue`
- `doi`
- `doi_link`
- `image`
- `year`

专利常见字段：

- `index`
- `inventors`
- `title`
- `kind`
- `patent_no`
- `year`

**素材放哪里**

- 成果视频、视频封面：[`assets/publication/`](assets/publication/)
- 论文预览图：[`assets/img/publication_preview/`](assets/img/publication_preview/)

**这页最容易踩坑的地方**

- 年份分组顺序由 `display_years` 控制，不只是看 `items` 里的 `year`。
- 如果你新增了某一年论文，但没在 `display_years` 里加这一年，这一组可能不会按你预期显示。
- 当前“项目”模块除了 `publications.projects.items` 里的文字，还会同时读取 [`_projects/`](_projects/) 里的项目卡片。
- 如果你发现成果页里出现了旧项目，不一定是 `publications.md` 写错，可能是 [`_layouts/publications.liquid`](_layouts/publications.liquid) 还在渲染 `site.projects`。

### 相关报道 `/reports/`

**先改哪里**

- 内容主入口：[`_pages/reports.md`](_pages/reports.md)
- 布局模板：[`_layouts/reports.liquid`](_layouts/reports.liquid)
- 样式：[`_sass/_reports.scss`](_sass/_reports.scss)
- 视频播放器脚本：[`assets/js/reports-video.js`](assets/js/reports-video.js)

**常改内容**

- 视频报道：`reports.videos.items`
- 图文报道：`reports.news.items`
- 是否显示“打开原文件”按钮：`reports.show_download_link`

视频条目最常用字段：

- `title`
- `date`
- `playback`

如果需要更完整配置，也可以用这些字段：

- `description`
- `poster`
- `original`

新闻条目最常用字段：

- `title`
- `date`
- `image`

如果你想点击跳外部新闻网页，也可以补：

- `link`
- `summary`

**素材放哪里**

- 视频、截图、海报建议统一放在 [`assets/reports/`](assets/reports/)

### 实验设备 `/equipment/`

**先改哪里**

- 内容主入口：[`_pages/equipment.md`](_pages/equipment.md)
- 布局模板：[`_layouts/equipment.liquid`](_layouts/equipment.liquid)
- 图库组件：[`_includes/equipment/gallery.liquid`](_includes/equipment/gallery.liquid)
- 样式：[`_sass/_equipment.scss`](_sass/_equipment.scss)

**常改内容**

- 实验室设备区：`equipment.lab.items`
- 工作区设备区：`equipment.workspace.items`

每个设备条目常见字段：

- `src`
- `alt`
- `caption`

**素材放哪里**

- 设备页图片建议统一放在 [`assets/equipment/`](assets/equipment/)

**这页最容易踩坑的地方**

- 首页设备预览会优先跟随本页内容。
- 如果你改了设备页图片，但首页没按预期变化，请先检查设备条目的顺序。

### 加入我们 `/jobs/`

**先改哪里**

- 内容主入口：[`_pages/jobs.md`](_pages/jobs.md)
- 布局模板：[`_layouts/jobs.liquid`](_layouts/jobs.liquid)
- 样式：[`_sass/_jobs.scss`](_sass/_jobs.scss)

**常改内容**

- 顶部说明：`jobs.hero`
- 为什么加入我们：`jobs.why_join.items`
- 申请方式：`jobs.apply`
- 岗位列表：`jobs.roles`

岗位条目中，当前页面实际最常显示的是：

- `title`
- `summary`
- `jd`

**要特别注意**

- `status` 和 `tags` 虽然保留在数据里，但当前 [`_layouts/jobs.liquid`](_layouts/jobs.liquid) 没有把它们显示出来。
- 如果你改了 `status` 或 `tags`，前台没有变化，这不是你改错了，而是当前模板没有渲染这些字段。

**素材放哪里**

- 招聘二维码、普通图片建议放在 [`assets/img/`](assets/img/)

### 联系方式 `/contact/`

**先改哪里**

- 内容文件：[`_pages/contact.md`](_pages/contact.md)
- 使用的通用布局：[`_layouts/page.liquid`](_layouts/page.liquid)

**这页的结构要特别理解**

[`_pages/contact.md`](_pages/contact.md) 分成两部分：

1. 上半部分 front matter：控制标题、导航、地图信息、页面内样式 `_styles`
2. 下半部分正文：控制“联系方式”“招生与合作”等文字内容

**常改内容**

- 地址：`baidu_map.address`
- 百度地图搜索词：`baidu_map.open_query`
- 静态地图图片：`baidu_map.fallback_image`
- 地图高度：`baidu_map.height`
- 页面正文：第二个 `---` 下面的 Markdown 正文

**素材放哪里**

- 地图图像和普通图片建议放在 [`assets/img/`](assets/img/)

**这页最容易踩坑的地方**

- 地图这块的样式不是在 `_sass`，而是直接写在 [`_pages/contact.md`](_pages/contact.md) 的 `_styles` 字段里。
- 如果地图样式有问题，先看本文件，不要先去别的 SCSS 里找。

## 素材怎么存

建议把素材按用途放到固定目录，后面维护会轻松很多。

| 素材类型                           | 推荐目录                                                                 | 主要对应页面                   |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------ |
| 团队头像                           | [`assets/team/`](assets/team/)                                           | 团队页、首页团队预览           |
| 首页横幅、通用图片、二维码、地图图 | [`assets/img/`](assets/img/)                                             | 首页、招聘页、联系页、研究方向 |
| 首页项目总览海报图                 | [`assets/img/home-overview-posters/`](assets/img/home-overview-posters/) | 首页                           |
| 首页概览视频                       | [`assets/mp4/`](assets/mp4/)                                             | 首页                           |
| 设备页图片                         | [`assets/equipment/`](assets/equipment/)                                 | 设备页、首页设备预览           |
| 研究成果视频和封面                 | [`assets/publication/`](assets/publication/)                             | 研究成果页                     |
| 论文预览图                         | [`assets/img/publication_preview/`](assets/img/publication_preview/)     | 研究成果页                     |
| 报道视频和截图                     | [`assets/reports/`](assets/reports/)                                     | 相关报道页                     |

### 素材命名建议

- 尽量用能看懂的文件名。
- 尽量不要频繁重名覆盖旧文件，除非你就是要替换原图。
- 新增素材时，建议统一写成 `/assets/...` 路径。
- 如果替换了同名图片但浏览器还显示旧图，先强制刷新浏览器缓存。

## 全站设置和导航

### 全站基础设置

这些内容主要在 [`_config.yml`](_config.yml)：

- 网站标题：`title`
- 站点描述：`description`
- 线上地址：`url`
- 子路径：`baseurl`

如果以后 GitHub 仓库名改变，`baseurl` 往往也要跟着改。

### 导航是怎么控制的

页面是否出现在导航里，主要看对应页面 front matter 里的这两个字段：

- `nav: true`
- `nav_order: 数字`

当前导航渲染代码在 [`_includes/header.liquid`](_includes/header.liquid)。

### 改导航顺序时怎么做

1. 打开对应页面，例如 [`_pages/team.md`](_pages/team.md)
2. 修改 `nav_order`
3. 保证每个页面的 `nav_order` 尽量唯一

> 当前仓库里 [`_pages/equipment.md`](_pages/equipment.md) 和 [`_pages/jobs.md`](_pages/jobs.md) 都是 `nav_order: 6`。如果你觉得导航顺序不稳定或不符合预期，可以先把它们改成不同数字。

### 首页导航标题在哪里来

左上角导航里的“首页”标题来自 [`_pages/home.md`](_pages/home.md) 的 `title`。

### 左上角 logo 在哪里

导航栏左上角图片当前来自：

- 模板：[`_includes/header.liquid`](_includes/header.liquid)
- 图片：`/assets/img/TeleAi.jpg`

如果只是换 logo，通常只需要替换图片文件或改图片路径。

## 哪些文件现在不要优先改

为了避免把维护者带偏，这里再集中强调一次：

- [`_site/`](_site/)：不要手动改
- [`_data/team.yml`](_data/team.yml)：不是当前团队页主入口
- [`_data/equipment_gallery.yml`](_data/equipment_gallery.yml)：不是当前设备页主入口
- [`_layouts/home_lab.liquid`](_layouts/home_lab.liquid)：不是当前首页模板
- [`assets/css/main.scss`](assets/css/main.scss)：它负责汇总样式，但具体页面样式通常应该去 [`_sass/`](./_sass/) 下对应文件改

如果你只是想改页面内容，请优先去 [`_pages/`](./_pages/)。

## 常见维护任务速查

### 1. 换首页横幅

1. 把新图片放到 [`assets/img/`](assets/img/)
2. 修改 [`_pages/home.md`](_pages/home.md) 里的 `top_banner.image`
3. 本地预览确认顶部横幅正常

### 2. 新增一位老师

1. 把头像放到 [`assets/team/`](assets/team/)
2. 打开 [`_pages/team.md`](_pages/team.md)
3. 在 `team.groups` 的 `id: teachers` 下新增成员
4. 填好 `name`、`role`、`subtitle`、`image`、`bio`
5. 如果需要个人主页或 Scholar，补 `links`

### 3. 新增一位博士生或硕士生

1. 打开 [`_pages/team.md`](_pages/team.md)
2. 在 `id: phd` 或 `id: ms` 下新增成员
3. 通常至少填写 `name`、`subtitle`、`bio`
4. 如果要加主页，可补 `links`

> 当前学生卡片默认是文字型，不一定显示头像。

### 4. 新增一篇论文

1. 把论文预览图放到 [`assets/img/publication_preview/`](assets/img/publication_preview/)
2. 打开 [`_pages/publications.md`](_pages/publications.md)
3. 在 `publications.records.papers.items` 里新增一条
4. 填好 `title`、`authors`、`venue`、`image`、`year`
5. 如果有 DOI，补 `doi`
6. 确认对应年份已经出现在 `display_years`

### 5. 新增一个成果视频

1. 把视频和封面放到 [`assets/publication/`](assets/publication/)
2. 打开 [`_pages/publications.md`](_pages/publications.md)
3. 在 `publications.videos.items` 下新增一条
4. 填好 `title`、`mp4`、`poster`

### 6. 新增一条视频报道

1. 把视频放到 [`assets/reports/`](assets/reports/)
2. 打开 [`_pages/reports.md`](_pages/reports.md)
3. 在 `reports.videos.items` 下新增一条
4. 至少填 `title`、`date`、`playback`

### 7. 新增一条新闻截图报道

1. 把截图放到 [`assets/reports/`](assets/reports/)
2. 打开 [`_pages/reports.md`](_pages/reports.md)
3. 在 `reports.news.items` 下新增一条
4. 至少填 `title`、`date`、`image`

### 8. 修改联系方式或地址

1. 打开 [`_pages/contact.md`](_pages/contact.md)
2. 改 `baidu_map.address`、`baidu_map.open_query`、`baidu_map.fallback_image`
3. 再改第二个 `---` 下面的正文文字

### 9. 替换招聘二维码

1. 把二维码放到 [`assets/img/`](assets/img/)
2. 打开 [`_pages/jobs.md`](_pages/jobs.md)
3. 修改 `jobs.apply.qr.image`

### 10. 改导航顺序

1. 打开对应页面，例如 [`_pages/publications.md`](_pages/publications.md)
2. 修改 `nav_order`
3. 尽量避免和其他页面重复
4. 本地刷新后检查导航顺序

## 补充资料

如果你遇到更复杂的情况，可以继续看这些文件：

- [`INSTALL.md`](INSTALL.md)：环境与部署说明
- [`CUSTOMIZE.md`](CUSTOMIZE.md)：al-folio 的更完整自定义说明
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)：常见错误排查
- [`.github/GIT_WORKFLOW.md`](.github/GIT_WORKFLOW.md)：仓库提交规范

## 最后一句最实用的经验

如果你不知道该改哪：

1. 先找对应页面的 [`_pages/*.md`](./_pages/)
2. 如果改了内容前台没变化，再查这个页面的 `layout`
3. 再去看对应的 [`_layouts/`](./_layouts/) 和 [`_sass/`](./_sass/)

大多数日常维护工作，走完这三步就能找到正确位置。
声明：本项目网页的模板是alshedivat/al-folio,项目所有权由alshedivat享有
