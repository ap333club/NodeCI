const {clearHash} = require('../services/cache');  //this is how oyou add a function

module.exports = async (req, res, next) => {
    await next();
    console.log('clean cache');
    clearHash(req.user.id);
};




// Since the route handler catches any errors while
// trying to save the blog post, wont the clearHash function 
//always run in the cleanCache middleware? That is, you'll always delete the cache regardless if the save went well or not.

// const clearHash = require('../services/cache').clearHash;
// module.exports = function (keyProvider) {
//   if (typeof keyProvider !== 'function') {
//     throw new Error('Cache key provider is not a function!');
//   }
//   return async (req, res, next) => {
//     await next();
//     if(res.statusCode < 400) {
//       const cacheKey = keyProvider(req, res);
//       console.log('Cleaning cache for::: ', cacheKey);
//       clearHash(cacheKey);
//     }
//   }
// };

// Since async (req, res, next) => {} is a middleware
//  itself, and because middleware are executed in sequential order,
//   we can place the cleanCache middleware at the very end of 
//   our app.post('/api/blogs') route handler, and call next() 
//   after res.send(blog):

// app.post('/api/blogs', requireLogin, async (req, res, next) => {
//   const { title, content } = req.body;
 
//   const blog = new Blog({
//     title,
//     content,
//     _user: req.user.id
//   });
 
//   try {
//     await blog.save();
//     res.send(blog);
//     next();
//   } catch (err) {
//     console.log('Create blog error', err);
//     res.send(400, err);
//   }
// }, cleanCache);