---
layout: page
title: 设备
permalink: /equipment/
nav: true
nav_order: 5
description: 实验室照片与工作环境照片。
---

<div class="equipment-page">
  <p>
    这里展示实验室与工作环境的部分照片。你可以在 <code>_data/equipment_gallery.yml</code> 中替换为真实图片与说明文字。
  </p>

  <h2>实验室照片</h2>
  <p class="text-muted">实验室空间、设备摆放与日常工作场景。</p>
  {% include equipment/gallery.liquid items=site.data.equipment_gallery.lab %}

  <h2>工作环境照片</h2>
  <p class="text-muted">外场测试、协作环境与工程部署场景。</p>
  {% include equipment/gallery.liquid items=site.data.equipment_gallery.workspace %}
</div>
