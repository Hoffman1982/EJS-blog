import express from 'express'
const app = express()
const port = 3000 

app.use(express.static('public'));
// mock database
const blogPosts = [
    { 
      id: 1,
      title: "The Future of Web Design in 2025",
      date: "April 20, 2025",
      excerpt: "Explore the cutting-edge trends that are shaping the future of web design and how you can implement them in your projects.",
      image: "https://cdn.mos.cms.futurecdn.net/xCSAEp8DjjrT2UQB87AoFN.jpg",
      content: "As technology evolves, so does the world of web design. In 2025, we're seeing a push toward immersive experiences, AI-powered personalization, and seamless interactivity. From 3D elements to voice-driven interfaces, designers must embrace innovation while keeping accessibility at the forefront. Staying updated on design systems and leveraging tools like Figma and Framer can help designers adapt and lead the charge into the future."
    },
    { id: 2,
      title: "10 UI/UX Principles Every Designer Should Know",
      date: "April 18, 2025",
      excerpt: "Master these fundamental principles of user interface and experience design to create engaging and intuitive digital products.",
      image: "https://images.ctfassets.net/wp1lcwdav1p1/31dUrsGyucK0UNmJEQUqj3/3c57d917e84f6500ee2ec54e8760b854/UX_vs_UI.png?w=1500&q=60",
      content: "Good design is invisible, and great design delights. These 10 principles—such as consistency, feedback, usability, and hierarchy—are essential for creating meaningful user experiences. By understanding user needs and behaviors, designers can craft interfaces that not only look good but also function seamlessly, ensuring user satisfaction and product success."
    },
    { id: 3,
      title: "The Art of Minimalist Web Design",
      date: "April 15, 2025",
      excerpt: "Less is more. Discover how minimalist design principles can create powerful, effective, and beautiful websites that convert.",
      image: "https://edu.sqi.ng/wp-content/uploads/2024/10/web-design.jpg",
      content: "Minimalist web design strips away the unnecessary, focusing on clarity, usability, and visual hierarchy. White space, simple typography, and restrained color palettes define this approach. In 2025, minimalist sites load faster, offer better user experiences, and align well with mobile-first strategies—making them an ideal choice for modern brands."
    },
    { id: 4,
      title: "Building Responsive Websites with Bootstrap 5",
      date: "April 12, 2025",
      excerpt: "Learn how to harness the power of Bootstrap 5 to create beautiful, responsive websites that look great on any device.",
      image: "https://www.entheosweb.com/wp-content/uploads/2023/07/Responsive_tut_fimg.jpg",
      content: "Bootstrap 5 offers powerful grid systems, utility classes, and components that make responsive web development easier than ever. With improvements in customization, JavaScript modularity, and RTL support, developers can quickly build layouts that adapt perfectly to any screen size. Learn how to structure your HTML and leverage Bootstrap's classes effectively."
    },
    { id: 5,
      title: "Color Psychology in Web Design",
      date: "April 10, 2025",
      excerpt: "Understanding how colors affect user emotions and behaviors can dramatically improve your website's effectiveness.",
      image: "https://studio1design.com/wp-content/uploads/2017/03/Studio1Design-BLOG-How-Important-is-Color-in-Website-Design-Images_IMAGE-2.jpg",
      content: "Colors influence perception and decision-making. Blue can build trust, red evokes urgency, and green is associated with growth. By applying color psychology strategically, designers can guide user emotions, improve conversions, and reinforce brand identity. This post explores practical ways to apply color theory in UI/UX design."
    },
    { id: 6,
      title: "5 JavaScript Frameworks to Watch in 2025",
      date: "April 8, 2025",
      excerpt: "Stay ahead of the curve with these cutting-edge JavaScript frameworks that are reshaping web development this year.",
      image: "https://media.licdn.com/dms/image/v2/D5612AQGUWgFcX7PGaA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1695478890123?e=2147483647&v=beta&t=m78k-HmAQAiREy6-MEiZDubMoJZczrsduLrL9IYljWc",
      content: "From SolidJS to Qwik and new iterations of Svelte and Vue, 2025 is a transformative year for JavaScript frameworks. These tools offer performance improvements, better DX (developer experience), and more modular architectures. Learn what makes each one unique, where they shine, and how to decide which framework suits your project best."
    }
  ];

  // routes
app.get('/',(req,res)=>{
    res.render('index.ejs',
        {
            title: 'Morden blogs',
            blogPosts: blogPosts
        }
    )
})
  app.get('/blog/:id',(req,res)=>{
      const postId= parseInt(req.params.id)
      const post= blogPosts.find(post => post.id ===postId)
      res.render('blog.ejs',{
        title: post.title,
        post: post
      })
  })

app.listen(port,() =>{
    console.log(`Server runing on port 3000`)
})