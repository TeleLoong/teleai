---
layout: home
title: 主页
permalink: /
description: 涉水具身智能 WeAI 实验室主页。
main_container_class: "container-fluid px-0 mt-0"

# Home page editable content guide:
# - Edit text, links, and images in `home.*` below.
# - `home.liquid` only controls layout and rendering structure.
# - Optional long-form markdown content can be written after front matter.

top_banner:
  enabled: true
  image: /assets/img/主页横幅图.png
  height: 312px
  size: 100% 100%
  position: center
  overlay: rgba(0, 0, 0, 0)

home:
  hero:
    title: |-
      Water-related Embodied
      AI Group
    tagline: 面向真实涉水环境，让机器人看得清、学得会、动得稳。
    intro: 我们聚焦空海跨域具身智能体与涉水光学/视觉，推动从仿真到真实的系统级闭环验证与部署。
    image: assets/img/Team.jpg
    image_alt: Team photo
  hero_actions:
    - text: 研究方向
      url: /research/
      style: btn-primary
    - text: 研究成果
      url: /publications/
      style: btn-outline-primary
    - text: 设备
      url: /equipment/
      style: btn-outline-primary
  research:
    title: 研究方向
    more_text: 查看详情
    more_url: /research/
    cards:
      - title: 空海跨域具身智能体
        lead: 面向空中/海面/水下等复杂环境，实现感知—规划—控制一体化的具身智能系统。
        bullets:
          - 跨域任务建模与策略学习（仿真到真实）
          - 多模态感知与鲁棒自主决策
          - 系统级闭环评测与真实场景部署
        link_text: 了解更多 →
        link_url: /research/
      - title: 涉水光学/视觉
        lead: 研究涉水成像机理与视觉增强，提升水下/水面场景的可见性与任务可用性。
        bullets:
          - 涉水成像建模、复原与增强
          - 视觉感知与任务理解（检测/分割/跟踪）
          - 轻量化与端侧部署，适应低光/浑浊环境
        link_text: 了解更多 →
        link_url: /research/
  team:
    title: 团队
    more_text: 查看全部
    more_url: /team/
    members:
      - name: 赵明
        role: PI / 实验室负责人
        image: assets/img/Team.jpg
        image_alt: 赵明
        url: /team/
      - name: 李华
        role: 博士研究生
        image: assets/img/8.jpg
        image_alt: 李华
        url: /team/
      - name: 王欣
        role: 硕士研究生
        image: assets/img/7.jpg
        image_alt: 王欣
        url: /team/
      - name: 陈宇
        role: 科研助理
        image: assets/img/6.jpg
        image_alt: 陈宇
        url: /team/
  equipment:
    title: 设备
    more_text: 查看全部
    more_url: /equipment/
    items:
      - image: assets/img/4.jpg
        image_alt: 实验平台设备 1
        url: /equipment/
      - image: assets/img/4.jpg
        image_alt: 实验平台设备 2
        url: /equipment/
      - image: assets/img/4.jpg
        image_alt: 实验平台设备 3
        url: /equipment/
  cta:
    title: 加入我们
    text: 欢迎对涉水具身智能与视觉感知感兴趣的同学加入团队，一起把研究做进真实场景。
    actions:
      - text: 查看招聘
        url: /jobs/
        style: btn-primary
      - text: 联系我们
        url: /contact/
        style: btn-outline-primary
---
<!-- 主页内容由 `_layouts/home.liquid` 渲染；需要改文案/按钮/图片请编辑本文件的 `home` 配置。 -->
