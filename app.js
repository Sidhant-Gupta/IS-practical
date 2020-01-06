const express = require('express');  
const app = express(); 
const path=require('path').join(__dirname+'/views/');
const bodyParser=require('body-parser');
const routing=require('./routing.js');
const session = require('express-session');
const cookie_parser=require('cookie-parser');

main();

function main()
{
   app_init();
   app_route();
}

function app_init()
{
   app.use(bodyParser.urlencoded({ extended: true })); 
   app.use(express.static('public'));
   app.set('views',path);
   app.set('view engine','pug');
   app.listen(3000, function () {  console.log("Server listening.")  }); 
   app.use(cookie_parser());
}

function app_route()
{
   app.get('/', function (req, res){routing.get_signup(req,res);});   
   app.post('/',function(req,res){ routing.post_signup(req,res)});

   app.get('/login',function(req,res){routing.get_login(req,res);});
   app.post('/login',function(req,res){routing.post_login(req,res);});

   app.get('/livecontests',function(req,res){routing.get_livecontests(req,res)});

   app.get('/logout',function(req,res){routing.get_logout(req,res)});
}





