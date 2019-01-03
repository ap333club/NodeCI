const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');  //this is how oyou add a function

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });
    res.send(blog);
  });


  app.get('/api/blogs', requireLogin, async (req, res) => {
    console.log(req.user.id);
    const blogs = await Blog.find({ _user: req.user.id }).cache({
      key: req.user.id
    });
    // console.log(blogs);
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);

    } catch (err) {
      res.send(400, err);
    }

    // clearHash(req.user.id);
  });
};



 // app.get('/api/blogs', requireLogin, async (req, res) => {
  //   const blogs = await Blog.find({ _user: req.user.id });

  //   const redis = require('redis')
  //   const redisUrl = 'redis://127.0.0.1:6379'
  //   const client = redis.createClient(redisUrl)
  //   const util = require('util');


  //   //do  we have any cached data in redis
  //   client.get  = util.promisify(client.get);

  //   const cachedBlogs = await client.get(req.user.id);

  //   if (cachedBlogs){
  //     console.log('SERVING FROM CACHE');
  //    // console.log(JSON.parse(cachedBlogs));
  //     return res.send(JSON.parse(cachedBlogs));
  //   }

  //   // else,  respond to request and update cache
  //   console.log('SERVING FROM MONOGDB');
  //   res.send(blogs);
  //   client.set(req.user.id,JSON.stringify(blogs));
  // });


