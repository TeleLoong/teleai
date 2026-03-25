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
  address: 上海市徐汇区龙文路199号国际传媒港F1座30层
  open_query: 中国电信人工智能研究院
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

  .contact-map-image-link,
  .contact-map-image-link figure,
  .contact-map-image-link picture,
  .contact-map-image-link img {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .contact-map-image-link {
    color: inherit;
    text-decoration: none;
  }

  .contact-map-image-link img {
    object-fit: cover;
  }

  .contact-map-actions {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    z-index: 2;
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

  .contact-map-image-link:focus-visible,
  .contact-map-link:focus-visible {
    outline: 2px solid #0f4fa8;
    outline-offset: 2px;
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

请点击下图或按钮在百度地图中查看

{% capture baidu_map_href %}https://api.map.baidu.com/geocoder?address={{ page.baidu_map.open_query | default: page.baidu_map.address | uri_escape }}&output=html{% endcapture %}

<div
  class="contact-map"
  style="--contact-map-height: {{ page.baidu_map.height }};"
>
  <a
    class="contact-map-image-link"
    href="{{ baidu_map_href }}"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="点击静态地图，在百度地图查看办公地址"
  >
    {% include figure.liquid
      loading="eager"
      path=page.baidu_map.fallback_image
      alt="办公地址地图"
      class="img-fluid z-depth-1"
    %}
  </a>

  <p class="contact-map-actions">
    <a
      class="contact-map-link"
      href="{{ baidu_map_href }}"
      target="_blank"
      rel="noopener noreferrer"
    >
      在百度地图打开
    </a>
  </p>
</div>

## 招生与合作

我们欢迎优秀的学生与合作伙伴加入团队或开展合作，
如有意向，请在邮件中简要说明研究兴趣与相关经历

孙哲老师邮箱： sunzhe@nwpu.edu.cn
