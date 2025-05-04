import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
const app = express()
const port = 3000 
import { createClient } from '@supabase/supabase-js'
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey)
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static('public'));
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});
const authenticateUser = async (req,res,next) =>{
  const token = req.cookies.authToken
  if (!token) {
   return res.redirect('/login')
  }
  try {
    const {data: {user}, error} = await supabase.auth.getUser(token)
    if (error || !user) {
    res.clearCookie('authToken')
    return res.redirect('/login')
    }
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.clearCookie('authToken')
    res.redirect('/login')
  }
}


  // routes
app.get('/',authenticateUser, async (req,res)=>{
 try {
  const {data: blogPosts, error}= await supabase
  .from('blog_posts')
  .select('*')
  .order('created_at', {ascending:false})
  if (error) throw error
    res.render('index.ejs',
        {
            title: 'Morden blogs',
            blogPosts: blogPosts, 
            user: req.user || null
        }
    )
    console.log(req.user)
 } catch (error) {
  console.error('Error fetch posts:',error)
  res.status(500).render('error.ejs',{message: 'failed to load blog post'})
 }
})
  app.get('/blog/:id',authenticateUser, async(req,res)=>{
     
      try {
        const postId= parseInt(req.params.id)
        const {data: post, error}= await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single()
       
        if (error) throw error
        res.render('blog.ejs',{
          title: post.title,
          post: post,
        user: req.user
        })
       } catch (error) {
        console.error('Error fetch posts:',error)
        res.status(500).render('error.ejs',{message: 'failed to load blog post'})
       }
     
  })
  app.get('/login', (req,res)=>{
    res.render('login.ejs', {
    title: 'login',
    error: null
    })
  })
   app.post('/login',async (req,res)=>{
    const {email,password}= req.body 
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email ,
        password ,
      })
      if (error) throw error
      res.cookie('authToken', data.session.access_token,{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7* 24 * 60 * 60 * 1000
      })
      res.redirect('/')
    } catch (error) {
      console.error('login error', error)
      res.render('login.ejs', {
      title: 'Login',
      error: error.message || 'Invalid email or password' 
      })
    }
   })
   app.get('/signup', (req,res)=>{
    res.render('signup.ejs', {
    title: 'signup',
    error: null
    })
  })
   app.post('/signup',async (req,res)=>{
    const {email,password}= req.body 
    try {
      const { data, error } = await supabase.auth.signUp({
        email ,
        password ,
      })
      if (error) throw error 
      if (data.session) {
        res.cookie('authToken', data.session.access_token,{
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7* 24 * 60 * 60 * 1000
          })
          res.redirect('/')
      }
     
      res.render('confirm-email.ejs',{
      title: 'Confirm Your Email',
      email: email
      })
    } catch (error) {
      console.error('signup error', error)
      res.render('signup.ejs', {
      title: 'signup',
      error: error.message || 'failed to create an account' 
      })
    }
   })
   app.get('/logout',(req,res)=>{
   res.clearCookie('authToken')
   res.redirect('/')
   })
   app.get('/admin/new-post',authenticateUser,(req,res)=>{
    res.render('new-post.ejs', {
    title: 'add a new blog',
    user: req.user 
    })
    console.log(req.user)
   })
   app.post('/admin/new-post',authenticateUser, upload.single('image'), async (req,res)=>{
    try {
      const { title, excerpt, content } = req.body;
      let imageUrl = "/api/placeholder/800/500"; // Default image
      
      // Upload image to Supabase Storage if provided
      if (req.file) {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const { data, error } = await supabase
          .storage
          .from('blog-images')
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype
          });
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from('blog-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }
      
      // Format current date
      const today = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const formattedDate = `${monthNames[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
      
      // Insert post into Supabase
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([
          {
            title,
            excerpt,
            content,
            image: imageUrl,
            date: formattedDate,
            author_id: req.user.id
          }
        ]);
      
      if (error) throw error;
      
      // Redirect to home page
      res.redirect('/');
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).render('error', { message: 'Failed to create blog post' });
    }
   })
   app.get('/contact', authenticateUser,(req, res) => {
    res.render('contact.ejs', { 
      title: 'Contact Us',
      user: req.user || null,
      success: false,
      error: null
    });
  });
  app.get('/about', authenticateUser,(req, res) => {
    res.render('about.ejs', { 
      title: 'About Us',
      user: req.user || null
    });
  });
  app.post('/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      
      
       const { data, error } = await supabase
        .from('contact_messages')
        .insert([{ name, email, subject, message }]);
      
      res.render('contact.ejs', { 
        title: 'Contact Us',
        user: req.user || null,
        success: true,
        error: null
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.render('contact.ejs', { 
        title: 'Contact Us',
        user: req.user || null,
        success: false,
        error: 'Failed to send your message. Please try again later.'
      });
    }
  });
app.listen(port,() =>{
    console.log(`Server runing on port 3000`)
})