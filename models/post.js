var mongodb = require('./db')
  , markdown = require('markdown').markdown;

function Post(name, title, post){
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

// 存储文章及相关信息
Post.prototype.save = function(callback){
  var date = new Date()
    , time = {
      date: date,
      year: date.getFullYear(),
      month: date.getFullYear() + '-' + (date.getMonth() + 1),
      day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
      minute: date.getFullYear() + '-' + (date.getMonth() + 1) + "-" + date.getDate() + ' ' + 
      date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())  
    };

  var post = {
      name: this.name,
      time: time,
      title: this.title,
      post: this.post
    };

  // 打开数据库
  mongodb.open(function(err, db){
    if(err) return callback(err);

    // 读取 posts 集合
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      // 将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function(err){
        mongodb.close();
        if(err) return callback(err);
        callback(null);
      });

    });

  });
}

// 读取所有文章
Post.getAll = function(name, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    // 读取 posts 集合
    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      var query = {};

      if(name) query.name = name;

      // 根据 query 对象查询文章
      collection.find(query)
        .sort({ time: -1 })
        .toArray(function(err, docs){
          mongodb.close();

          if(err) return callback(err);

          docs.forEach(function(doc){
            doc.post = markdown.toHTML(doc.post);
          });
          
          callback(null, docs);
        });
    });
  });
}

// 读取1篇文章
Post.getOne = function(name, day, title, callback){
  mongodb.open(function(err, db){
    if(err) return callback(err);

    db.collection('posts', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }

      collection.findOne({
        'name': name,
        'time.day': day,
        'title': title
      }, function(err, doc){
        mongodb.close();
        if(err) return callback(err);
        doc.post = markdown.toHTML(doc.post);
        callback(null, doc);
      });
    });
  });
}
