let express = require('express');
let router = express.Router();

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

process.on('uncaughtException', function (err) {
  console.log(err);
}); 

let Bookshelf = require('bookshelf')(knex);

Bookshelf.plugin('pagination');

let User = Bookshelf.Model.extend({
  tableName: 'users'
});

let Message = Bookshelf.Model.extend({
  tableName: 'message',
  hasTimestamps: true,
  user: function(){
    return this.belongsTo(User);
  }
});

router.get('/', (req, res, next)=>{
  res.redirect('/');
});

router.get('/:id', (req, res, next)=>{
  res.redirect('/home' + req.params.id + '/1');
});

router.get('/:id/:page', (req, res, next)=>{
  let id = req.params.id;
  id *= 1;
  let pg = req.params.page;
  pg *= 1;
  if(pg < 1){ pg = 1; }
  new Message().orderBy('created_at', 'DESC')
    .then((collection)=>{
      let data={
        title: 'miniBoard',
        login: req.session.login,
        user_id:id,
        collection: collection.toArray(),
        pagination:collection.pagination
      };
      res.render('home', data);
    }).catch((err)=>{
      res.status(500).json({error: true, data:{message: err.message}});
    });
});

module.exports = router;
