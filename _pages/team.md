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
    email: you@university.edu
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
    name: "你的名字"
    role: Principal Investigator
    subtitle: "Faculty, University XX"
    image: assets/img/TeleAi.jpg
    email: you@university.edu
    links:
      - label: Homepage
        url: https://example.com
      - label: Google Scholar
        url: https://scholar.google.com/
    bio: >
      这里写 PI 简介（支持多行）。你可以介绍研究方向、实验室使命，
      以及招募/合作信息等。
  groups:
    - id: teachers
      title: Teachers
      members:
        - id: teacher_a
          name: Teacher A
          role: Faculty
          image: assets/img/12.jpg
        - id: teacher_b
          name: Teacher B
          role: Faculty
          image: assets/img/9.jpg
        - id: teacher_c
          name: Teacher C
          role: Faculty
          image: assets/img/8.jpg
    - id: phd
      title: PhD Students
      members:
        - id: member_a
          name: Alice Zhang
          role: PhD Student
          subtitle: "Perception / Field Robotics"
          image: assets/img/1.jpg
          email: alice@university.edu
          links:
            - label: Homepage
              url: https://example.com
            - label: Google Scholar
              url: https://scholar.google.com/
        - id: member_b
          name: Bob Li
          role: PhD Student
          subtitle: "Planning / Autonomy"
          image: assets/img/10.jpg
        - id: member_d
          name: David Chen
          role: PhD Student
          subtitle: "Marine Perception / Vision"
          image: assets/img/7.jpg
    - id: ms
      title: MS Students
      members:
        - id: member_c
          name: Carol Wang
          role: MS Student
          subtitle: "Controls / Systems"
          image: assets/img/3.jpg
        - id: member_e
          name: Evan Liu
          role: MS Student
          subtitle: "Embedded AI / Hardware"
          image: assets/img/6.jpg
        - id: member_f
          name: Fiona Sun
          role: MS Student
          subtitle: "Field Deployment / Testing"
          image: assets/img/5.jpg
    - id: ug
      title: Undergraduate
      members: []
  alumni_groups: []
---

<!-- 可选：在这里写团队页补充说明（Markdown）。 -->
