---
layout: home
title: 团队主页
permalink: /
description: 涉水具身智能 WeAI 实验室主页。
main_container_class: "container-fluid px-0 mt-0"

# Home page editable content guide:
# - Edit text, links, and images in `home.*` below.
# - `home.liquid` only controls layout and rendering structure.
# - Optional long-form markdown content can be written after front matter.

top_banner:
  enabled: true
  image: /assets/img/主页横幅图.jpg
  height: 312px
  size: 100% 100%
  position: center
  overlay: rgba(0, 0, 0, 0)

home:
  hero:
    title: |-
      Water-related Embodied
      AI Group
    tagline: "涉水光学&具身智能，让机器人看得清、学得会、动得稳"
    intro: 我们聚焦空海跨域具身智能体与涉水光学/视觉，推动从仿真到真实的系统级闭环验证与部署
    image: assets/img/Teampicture.jpg
    image_alt: Team photo
  hero_actions: []
  research:
    title: 研究方向
    more_text: 查看详情
    more_url: /research/
    cards:
      - title: 空海跨域具身智能体
        lead: 面向空中/海面/水下等涉水环境，实现感知、规划、控制一体化的具身智能系统
        bullets:
          - 跨域任务建模与策略学习（仿真到真实）
          - 多模态感知与鲁棒自主决策
          - 系统级闭环评测与真实场景部署
        link_text: 了解更多 →
        link_url: /research/
      - title: 涉水光学/视觉
        lead: 研究涉水光学/视觉，提升目标的可见性与任务的成功率
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
      - name: 陈翼钒
        role: 高级研究员
        image: assets/team/chenyifan.jpg
        image_alt: 陈翼钒
        url: /team/
  equipment:
    title: 设备
    more_text: 查看全部
    more_url: /equipment/
    items:
      - image: assets/equipment/uv-lit-hydrodynamics-test-pool.jpg
        image_alt: 蓝光照明条件下的动捕水池
        url: /equipment/
      - image: assets/equipment/yellow-water-robot-surface-test.jpg
        image_alt: 跨域航行器 Teleaqua-Bee 水下测试
        url: /equipment/
      - image: assets/equipment/white-water-robot-remote-control-test.jpg
        image_alt: 跨域航行器 Teleaqua-H4Z 水面测试
        url: /equipment/
      - image: assets/equipment/orange-water-robot-underwater-obstacle-course.jpg
        image_alt: 跨域航行器 Teleaqua-H8 避障航行测试
        url: /equipment/
  overview:
    title: 项目总览图
    image: assets/img/TeleAI-涉水具身智能团队.png
    image_alt: 项目总览图
    rov:
      video: /assets/mp4/海缆作业.mp4
      poster: /assets/img/home-overview-posters/rov.jpg
      aria_label: 深海ROV海缆作业视频
    cable_inspection:
      aria_label: 海缆巡检原始图像与复原增强图像分屏视频
      top:
        video: /assets/mp4/海缆巡检原始图像.mp4
        poster: /assets/img/home-overview-posters/cable-inspection-top.jpg
        aria_label: 海缆巡检原始图像视频
      bottom:
        video: /assets/mp4/复原增强图像.mp4
        poster: /assets/img/home-overview-posters/cable-inspection-bottom.jpg
        aria_label: 复原增强图像视频
    wetplug:
      aria_label: 深海湿插拔线缆目标检测跟踪分屏视频
      top:
        video: /assets/mp4/深海湿插拔线缆目标检测跟踪1.mp4
        poster: /assets/img/home-overview-posters/wetplug-top.jpg
        aria_label: 深海湿插拔线缆目标检测跟踪视频1
      bottom:
        video: /assets/mp4/深海湿插拔线缆目标检测跟踪2.mp4
        poster: /assets/img/home-overview-posters/wetplug-bottom.jpg
        aria_label: 深海湿插拔线缆目标检测跟踪视频2
    auv_guide:
      aria_label: AUV水下回收光学导引分屏视频
      top:
        video: /assets/mp4/光学导引.mp4
        poster: /assets/img/home-overview-posters/auv-guide-top.jpg
        aria_label: 光学导引视频
        preload: auto
      bottom:
        video: /assets/mp4/AUV水下回收光学导引.mp4
        poster: /assets/img/home-overview-posters/auv-guide-bottom.jpg
        aria_label: AUV水下回收光学导引视频2
    uav:
      bottom_left:
        video: /assets/mp4/无人机起飞图1.mp4
        poster: /assets/img/home-overview-posters/uav-bottom-left.jpg
        aria_label: 无人机起飞视频1
      bottom_mid:
        video: /assets/mp4/无人机起飞图2.mp4
        poster: /assets/img/home-overview-posters/uav-bottom-mid.jpg
        aria_label: 无人机起飞视频2
      bottom_right:
        video: /assets/mp4/无人机起飞图3.mp4
        poster: /assets/img/home-overview-posters/uav-bottom-right.jpg
        aria_label: 无人机起飞视频3
  cta:
    title: 加入我们
    text: 欢迎对涉水具身智能与视觉感知感兴趣的同学加入团队，一起把研究做进真实场景
    actions:
      - text: 加入我们
        url: /jobs/
        style: btn-primary
      - text: 联系方式
        url: /contact/
        style: btn-primary
---

<!-- 主页内容由 `_layouts/home.liquid` 渲染；需要改文案/按钮/图片请编辑本文件的 `home` 配置。 -->
