---
layout: team
title: 团队
permalink: /team/
nav: true
nav_order: 1
description: 团队成员信息。
hide_page_header: true
main_container_class: "container-fluid px-0 mt-0"

# Team page editable content guide:
# - Edit all team content in `team.*` below.
# - `team.liquid` only controls layout and rendering structure.
# - Use existing image paths under `assets/img/`.

team:
  defaults:
    links:
      - label: Homepage
        url: https://example.com
      - label: Google Scholar
        url: https://scholar.google.com/
  featured_ids:
    - pi
    - member_a
    - member_b
    - member_c
  lead:
    id: pi
    name: "孙哲"
    role: TeleAI研究科学家（双聘）、PI
    subtitle: "西北工业大学副教授"
    image: assets/team/sun-laoshi.jpg
    links:
      - label: Homepage
        url: https://teacher.nwpu.edu.cn/2022010060.html
      - label: Google Scholar
        url: https://scholar.google.com/citations?hl=en&user=i2TQSssAAAAJ&view_op=list_works&sortby=pubdate
    bio: >
      德国耶拿大学博士后，亥姆霍兹研究所博士后。研究方向为涉水光学成像探测、涉水具身智能技术研究
  groups:
    - id: teachers
      title: 全职（研究员/工程师）
      members:
        - id: teacher_zhengye
          name: 郑业
          role: 高级研究员
          subtitle: 算法开发
          image: assets/team/zhengye.jpg
          links:
            - label: Google Scholar
              url: https://scholar.google.com/citations?user=9XGQQ8MAAAAJ&hl=en
          bio: >
            浙江大学博士，主要负责算法开发。曾任中国航空无线电电子研究所应用技术研究师。研究方向为计算机视觉、无人机视觉
        - id: teacher_yaokanzhong
          name: 姚衎仲
          role: 高级研究员
          subtitle: 算法开发
          image: assets/team/yaokanzhong.jpg
          links:
            - label: Homepage
              url: https://drunkbot.github.io/
            - label: Google Scholar
              url: https://scholar.google.com/citations?user=HzSl9LAAAAAJ&hl=en
          bio: >
            高级研究员，主要负责算法开发。英国曼彻斯特大学博士，曾任英国原子能机构、日本原子能机构 Fellow。 研究方向为多机器人系统在极端环境下的协同控制与感知
        - id: teacher_wangyoudong
          name: 王友东
          role: 高级工程师
          subtitle: 结构设计
          image: assets/team/wangyoudong.jpg
          bio: >
            高级工程师，主要负责结构设计。中国海洋大学硕士，曾任青岛国实智能装备科技有限公司、青岛崂山实验室结构工程师。研究方向为水下机器人结构设计
        - id: teacher_chenyifan
          name: 陈翼钒
          role: 博士后
          subtitle: 深度学习
          image: assets/team/chenyifan.jpg
          links:
            - label: Google Scholar
              url: https://scholar.google.com/citations?user=l5DNY8cAAAAJ&hl=zh-CN
          bio: >
            西北工业大学博士，主要负责算法开发。研究方向为深度学习与水下计算成像技术
        - id: teacher_biyuanbo
          name: 毕鸢博
          role: 高级研究员
          subtitle: 算法开发
          image: assets/team/biyuanbo.jpg
          links:
            - label: Google Scholar
              url: https://www.researchgate.net/profile/Yuanbo-Bi
          bio: >
            高级研究员，主要负责算法开发。上海交通大学博士。研究方向为海空两栖航行器设计与跨域策略
        - id: teacher_wangjiaguo
          name: 王家国
          role: 工程师
          subtitle: 强化学习
          image: assets/team/wangjiaguo.jpg
          bio: >
            西北工业大学博士，帝国理工学院硕士，主要从事强化学习及机器人/无人机系统硬件研发。研究方向为机器人与无人机系统硬件研发
        - id: teacher_pengzimeng
          name: 彭子蒙
          role: 工程师
          subtitle: 机器人设计
          image: assets/team/pengzimeng.jpg
          bio: >
            北京航空航天大学硕士，曾任中国航空无线电电子研究所工程师。研究方向为水下机器人系统设计
    - id: phd
      title: 博士研究生
      members:
        - id: member_a
          name: Alice Zhang
          role: 博士研究生
          subtitle: "Perception / Field Robotics"
          image: assets/img/1.jpg
          links:
            - label: Homepage
              url: https://example.com
            - label: Google Scholar
              url: https://scholar.google.com/
        - id: member_b
          name: Bob Li
          role: 博士研究生
          subtitle: "Planning / Autonomy"
          image: assets/img/10.jpg
        - id: member_d
          name: David Chen
          role: 博士研究生
          subtitle: "Marine Perception / Vision"
          image: assets/img/7.jpg
    - id: ms
      title: 硕士研究生
      members:
        - id: member_c
          name: Carol Wang
          role: 硕士研究生
          subtitle: "Controls / Systems"
          image: assets/img/3.jpg
        - id: member_e
          name: Evan Liu
          role: 硕士研究生
          subtitle: "Embedded AI / Hardware"
          image: assets/img/6.jpg
        - id: member_f
          name: Fiona Sun
          role: 硕士研究生
          subtitle: "Field Deployment / Testing"
          image: assets/img/5.jpg
    - id: ug
      title: Undergraduate
      members: []
  alumni_groups: []
---

<!-- 可选：在这里写团队页补充说明（Markdown）。 -->
