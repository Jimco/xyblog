
/*
 * GET home page.
 */

var crypto = require('crypto')
  , User = require('../models/user')
  , Post = require('../models/post');


module.exports = function(app){

  // 页面响应
  app.get('/', function (req, res) {
    Post.get(null, function(err, posts){
      if(err) posts = [];

      res.render('index', {
        title: '主页',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });


      
  });


  // 发布页面
  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.get('/post', checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user
      , post = new Post(currentUser.name, req.body.title, req.body.post);

    post.save(function(err){
      if(err){
        req.flash('error', err);
        return res.redirect('/');
      }

      req.flash('success', '发布成功！');
      res.redirect('/');
    });
  });


  // 注册页面
  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name
      , password = req.body.password
      , password2 = req.body.password2;

    if(password !== password2){
      req.flash('error', '两次输入的密码不一致！');
      console.log('error', '两次输入的密码不一致！', password, password2);
      return res.redirect('/reg');
    }

    var md5 = crypto.createHash('md5')
      , password = md5.update(req.body.password).digest('hex');

    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
      });

    User.get(newUser.name, function(err, user){
      if(user){
        req.flash('error', '用户已存在！');
        console.log('error', '用户已存在！', user);
        return res.redirect('/reg');
      }

      newUser.save(function(err, user){
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        console.log('success', '注册成功!', user);
        res.redirect('/');
      });
    });

  });


  // 登录页面
  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5')
      , password = md5.update(req.body.password).digest('hex');

    //检查用户是否存在
    User.get(req.body.name, function(err, user){
      if(!user){
        req.flash('error', '用户不存在!');
        console.log('error', '用户不存在!', err);
        return res.redirect('/login'); // 用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        console.log('error', '密码错误!', password);
        return res.redirect('/login'); // 密码错误则跳转到登录页
      }
      // 用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.flash('success', '登陆成功!');
      console.log('success', '登陆成功!');
      res.redirect('/'); // 登陆成功后跳转到主页
    });

  });


  // 登出页面
  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res){
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/'); // 登出成功后跳转到主页
  });



  function checkLogin(req, res, next){
    if(!req.session.user){
      req.flash('error', '未登录!'); 
      res.redirect('/login');
    }
    next();
  }

  function checkNotLogin(req, res, next){
    if(req.session.user){
      req.flash('error', '已登录!'); 
      res.redirect('back'); // 返回之前的页面
    }
    next();
  }

}