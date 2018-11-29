var express = require('express');
var router = express.Router();

let mysql = require('mysql');

let knex = require('knex')({
  dialect: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mini_board',
    charset: 'utf8'
  }
});

let Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('pagination');

// ユーザーモデルの作成
let User = Bookshelf.Model.extend({
  tableName: 'users'
});

// メッセージモデルの作成
let Message = Bookshelf.Model.extend({
  tableName: 'messages',
  // ↓タイムスタンプのデータをレコードに追加
  hasTimestamps: true,
  // ↓アソシエーションの定義
  user: function(){
    return this.belongsTo(User);
  }
});

/* GET home page. */
router.get('/', (req, res, next)=> {
  if(req.session.login == null){
    res.redirect('/users');
  } else {
    res.redirect('/1');
  }
});

router.get('/:page', (req, res, next) => {
  if(req.session.login == null){
    res/redirect('/users');
    return;
  }
  let pg = req.params.page;
  pg *= 1
  if(pg < 1){pg = 1;}
  console.log(pg);
  new Message().orderBy('created_at', 'DESC')
    .fetchPage({page:pg, pageSize:10, withRelated: ['user']})
    .then((collection) => {
      let data = {
        title: 'miniBoard',
        login: req.session.login,
        collection: collection.toArray(),
        pagination:collection.pagination
      };
      console.log('==============');
      console.log('データベースへのアクセス成功');
      console.log('==============');
      res.render('index', data);
    }).catch((err) => {
      res.status(500).json({error: true, data: {message: err.message}});
      console.log('エラーです。')
    });
});

router.post('/', (req, res, next) => {
  let rec = {
    message: req.body.msg,
    user_id: req.session.login.id
  }
  new Message(rec).save().then((model) => {
    res.redirect('/');
  });
})

module.exports = router;
