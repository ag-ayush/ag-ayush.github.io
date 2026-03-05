// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-scaling-our-microservice-made-latency-worse-here-39-s-how-we-fixed-it",
        
          title: "Scaling Our Microservice Made Latency Worse - Here&#39;s How We Fixed It",
        
        description: "We prescale for EC2 headroom and regional failover during business-critical times. Low traffic left DynamoDB connections idle and the HTTP client we&#39;d chosen for fast pod startup closed them in ~5s. Here&#39;s how we fixed p99 with configurable idle timeout and TCP keepalive.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/prescaling-latency-backfire/";
          
        },
      },{id: "post-stop-writing-data-you-never-read",
        
          title: "Stop Writing Data You Never Read",
        
        description: "At 2,600 TPS, we were executing 85M writes daily for data we rarely read. Here&#39;s how understanding our access pattern reduced writes by 75% using caching.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/authentication-attempt-caching/";
          
        },
      },{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/resume.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%61%67.%67%6F%65%6C%61%79%75%73%68@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/ag-ayush", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/ag-ayush", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
