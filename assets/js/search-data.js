// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-主页",
    title: "主页",
    section: "Navigation",
    handler: () => {
      window.location.href = "/al-folio/";
    },
  },{id: "nav-团队",
          title: "团队",
          description: "团队成员信息。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/team/";
          },
        },{id: "nav-研究方向",
          title: "研究方向",
          description: "面向空海跨域具身智能体与涉水光学/视觉的研究。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/research/";
          },
        },{id: "nav-研究成果",
          title: "研究成果",
          description: "论文、项目与学术成果，按时间倒序展示。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/publications/";
          },
        },{id: "nav-设备",
          title: "设备",
          description: "实验室照片与工作环境照片。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/equipment/";
          },
        },{id: "nav-招聘",
          title: "招聘",
          description: "招聘信息与申请方式。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/jobs/";
          },
        },{id: "nav-联系方式",
          title: "联系方式",
          description: "联系信息与加入方式。",
          section: "Navigation",
          handler: () => {
            window.location.href = "/al-folio/contact/";
          },
        },{id: "post-google-gemini-updates-flash-1-5-gemma-2-and-project-astra",
        
          title: 'Google Gemini updates: Flash 1.5, Gemma 2 and Project Astra <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "We’re sharing updates across our Gemini family of models and a glimpse of Project Astra, our vision for the future of AI assistants.",
        section: "Posts",
        handler: () => {
          
            window.open("https://blog.google/technology/ai/google-gemini-update-flash-ai-assistant-io-2024/", "_blank");
          
        },
      },{id: "post-displaying-external-posts-on-your-al-folio-blog",
        
          title: 'Displaying External Posts on Your al-folio Blog <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.open("https://medium.com/@al-folio/displaying-external-posts-on-your-al-folio-blog-b60a1d241a0a?source=rss-17feae71c3c4------2", "_blank");
          
        },
      },{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/al-folio/assets/pdf/example_pdf.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/al-folio/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
        },
      },];
