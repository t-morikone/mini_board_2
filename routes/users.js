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

let User = Bookshelf.Model.extend({
  tableName: 'users'
});

router.get('/add', (req, res, next) => {
  let data = {
    title: 'Users/Add',
    form: {name: '', password: '', comment:''},
    content: '※登録する名前・パスワード・コメントを入力してください'
  }
  res.render('users/add', data);
});

router.post('/add', (req, res, next) => {
  let request = req;
  let response = res;
  req.check('name','NAMEhは必ず入力してください').notEmpty();
  req.check('password', 'PASSWORD は必ず入力してください').notEmpty();
  req.getValidationResult().then((result) => {
    if(!result.isEmpty()){
      let content = '<ul class="error">'
      let result_arr = result.array();
      for(let n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      let data = {
        title: 'Users/Add',
        content: content,
        form: req.body
      }
      response.render('users/add', data); 
    } else {
      request.session.login = null;
      new User(req.body).save().then((model) => {
        response.redirect('/');
      });
    }
  });
});

router.get ('/', (req, res, next) => {
  let data = {
    title: 'Users/Login',
    form: {name: '', password: ''},
    content: '名前とパスワードを入力してください'
  }
  res.render('users/login', data);
});

router.post('/', (req, res, next) => {
  let request = req;
  let response = res;
  req.check('name', 'NAMEは必ず入力してください').notEmpty();
  req.check('password', 'PASSWORDは必ず入力してください').notEmpty();
  req.getValidationResult().then((result) => {
    if (!result.isEmpty()) {
      let content = '<ul class="error">';
      let result_arr = result.array();
      for(let n in result_arr){
        content += '<li>' + result_arr[n].msg + '</li>'
      }
      content += '</ul>';
      let data = {
        title: 'Users/Login',
        content: content,
        form: req.body
      }
      response.render('users/login', data);
    } else {
      let nm = req.body.name;
      let pw = req.body.password;
      User.query({where: {name: nm}, andWhere: {password: pw}})
        .fetch()
        .then((model) => {
          console.log("thenまでは成功");
          console.log(model);
          if(model == null){
            let data = {
              title: '再入力',
              content: '<p class="error">名前またはパスワードが違います</p>',
              form: req.body
            };
            response.render('users/login', data);
          } else {
            console.log("==============================");
            console.log(request.session);
            request.session.login = model.attributes;
            console.log("デバッグ１");
            let data = {
              title: 'Users/Login',
              content: '<p>ログインしました！<br>トップページに戻ってメッセージを送信ください</p>',
              form: req.body
            };
            response.render('users/login', data);
          }
        });
    }
  })
});

module.exports = router;
