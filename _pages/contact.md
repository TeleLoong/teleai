---
layout: page
title: 联系方式
permalink: /contact/
nav: true
nav_order: 7
description: 联系信息与加入方式。
hide_page_header: true
main_container_class: "container mt-3"
baidu_map:
  enabled: true
  address: 上海市徐汇区龙文路199号国际传媒港F1座30层
  title: TeleAI 涉水具身智能团队
  zoom: 18
  height: 420px
  fallback_image: /assets/img/公司地址.png
_styles: |
  .post article > p {
    font-size: 1.122rem;
  }

  .post article > p code {
    font-size: 1em;
  }

  .post article > .contact-map {
    position: relative;
    max-width: 560px;
    height: var(--contact-map-height, 420px);
    margin: 1rem 0 2rem;
    border-radius: 0.5rem;
    overflow: hidden;
    background: #f6f7f9;
    box-shadow: 0 0.125rem 0.5rem rgba(17, 24, 39, 0.08);
  }

  .contact-map-embed,
  .contact-map-fallback {
    position: absolute;
    inset: 0;
  }

  .contact-map-embed {
    z-index: 0;
  }

  .contact-map-embed.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .contact-map-fallback {
    z-index: 1;
    background: #fff;
  }

  .contact-map-fallback.is-hidden {
    display: none;
  }

  .contact-map-fallback figure,
  .contact-map-fallback picture,
  .contact-map-fallback img {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .contact-map-fallback img {
    object-fit: cover;
  }

  .contact-map-actions {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    margin: 0;
    padding: 0.45rem 0.85rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 0.125rem 0.5rem rgba(17, 24, 39, 0.12);
  }

  .contact-map-link {
    color: #0f4fa8;
    text-decoration: none;
    font-weight: 600;
  }

  .contact-map-link:hover,
  .contact-map-link:focus {
    text-decoration: underline;
  }

  @media (max-width: 767.98px) {
    .post article > .contact-map {
      height: min(70vw, var(--contact-map-height, 420px));
    }

    .contact-map-actions {
      right: 0.75rem;
      bottom: 0.75rem;
    }
  }
---

## 联系方式

办公地址：`上海市徐汇区龙文路199号国际传媒港F1座30层（下图红点位置）`

<div
  class="contact-map"
  style="--contact-map-height: {{ page.baidu_map.height }};"
>
  <div
    class="contact-map-embed is-hidden"
    id="contact-baidu-map"
    aria-label="办公地址地图"
    data-map-ak="{{ site.baidu_map.ak | escape_once }}"
    data-map-address="{{ page.baidu_map.address | escape_once }}"
    data-map-title="{{ page.baidu_map.title | escape_once }}"
    data-map-zoom="{{ page.baidu_map.zoom }}"
  ></div>

  <div class="contact-map-fallback" id="contact-baidu-map-fallback">
    {% include figure.liquid
      loading="eager"
      path=page.baidu_map.fallback_image
      alt="办公地址地图"
      class="img-fluid z-depth-1"
    %}
    <p class="contact-map-actions">
      <a
        class="contact-map-link"
        href="https://map.baidu.com/search/{{ page.baidu_map.address | uri_escape }}"
        target="_blank"
        rel="noopener noreferrer"
      >
        在百度地图打开
      </a>
    </p>
  </div>
</div>

## 招生与合作

我们欢迎优秀的学生与合作伙伴加入团队或开展合作，
如有意向，请在邮件中简要说明研究兴趣与相关经历

孙哲老师邮箱： sunzhe@nwpu.edu.cn
