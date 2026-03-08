---
layout: page
title: 研究方向
permalink: /research/
nav: true
nav_order: 2
description: 面向空海跨域具身智能体与涉水光学/视觉的研究。
main_container_class: "container mt-4"
---

<div class="research-page">
  <p class="research-intro">
    我们关注真实复杂环境中的智能机器人系统与计算成像问题，覆盖从机理建模到算法实现、从仿真评测到真实场景部署的完整链路。
  </p>

  <div class="research-quicklinks" aria-label="Quick links">
    <a class="btn btn-sm btn-outline-primary" href="{{ '/publications/' | relative_url }}">研究成果</a>
    <a class="btn btn-sm btn-outline-primary" href="{{ '/jobs/' | relative_url }}">招聘</a>
    <a class="btn btn-sm btn-outline-primary" href="{{ '/equipment/' | relative_url }}">设备</a>
  </div>

  <div class="research-grid row">
    <div class="col-12 col-lg-6">
      <section class="research-card" aria-label="空海跨域具身智能体">
        <h2>空海跨域具身智能体</h2>
        <p class="research-desc">
          面向空中/海面/水下等复杂环境，实现感知—规划—控制一体化的具身智能系统。
        </p>
        <ul>
          <li>跨域任务建模与策略学习（仿真到真实）</li>
          <li>多模态感知与鲁棒自主决策</li>
          <li>系统级闭环评测与真实场景部署</li>
        </ul>
        <img class="research-image" src="{{ '/assets/img/1.jpg' | relative_url }}" alt="空海跨域具身智能体研究示意图">
      </section>
    </div>

    <div class="col-12 col-lg-6">
      <section class="research-card" aria-label="涉水光学/视觉">
        <h2>涉水光学/视觉</h2>
        <p class="research-desc">
          研究涉水成像机理与视觉增强，提升水下/水面场景的可见性与任务可用性。
        </p>
        <ul>
          <li>涉水成像建模、复原与增强</li>
          <li>视觉感知与任务理解（检测/分割/跟踪）</li>
          <li>轻量化与端侧部署，适应低光/浑浊环境</li>
        </ul>
        <img class="research-image" src="{{ '/assets/img/4.jpg' | relative_url }}" alt="涉水光学与视觉研究示意图">
      </section>
    </div>
  </div>
</div>
