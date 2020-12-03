const express = require('express');  
const app = express(); 
const path=require('path').join(__dirname+'/views/');
const bodyParser=require('body-parser');
const routing=require('./routing.js');
const session = require('express-session');
const cookie_parser=require('cookie-parser');
const jwt = require('jsonwebtoken');

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
   app.listen(4000, function () {  console.log("Server listening.")  }); 
   app.use(cookie_parser());
}

function check_login(req,res)
{
   // console.log(req.headers);
   if(req.cookies.user_info)
   {
      console.log(req.cookies.user_info);let flag=false;
      jwt.verify(req.cookies.user_info.jwt_token,'admin_sid',function(err,decoded){
         if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
      console.log(decoded);
      // res.status(200).send(decoded);
      console.log("decoded");
      flag=true;
      })
      return flag;
    }

      return false;
}

function app_route()
{
   app.get('/'
   ,function (req, res,next)
   {
      if(check_login(req,res))next();
      else routing.get_signup(req,res);
   }
   ,function(req,res){res.redirect('/livecontests')});

   app.post('/',function(req,res){routing.post_signup(req,res)});

   app.get('/login'
   ,function(req, res, next)
   { 
      if(check_login(req,res))next();
      else routing.get_login(req,res);
   }
   ,function(req,res){res.redirect('/livecontests')});
   

   app.post('/login', function(req,res){routing.post_login(req,res);});

   app.get('/livecontests'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,function(req,res){routing.get_livecontests(req,res);});

   app.get('/login'
   ,function(req, res, next)
   { 
      if(check_login(req,res))next();
      else routing.get_login(req,res);
   }
   ,function(req,res){res.redirect('/livecontests')});
   

   app.post('/login', function(req,res){routing.post_login(req,res);});

   app.get('/livecontests'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,function(req,res){routing.get_livecontests(req,res);});

   app.get('/contest/:contest_id'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,async function(req,res){routing.get_contest(req,res);});

   app.get('/contest/:contest_id/questions'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,async function(req,res){routing.get_start_contest(req,res);});

   app.get('/contest/:contest_id/questions/:question_id'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,async function(req,res){routing.get_contest_question(req,res);});

  app.post('/contest/:contest_id/questions/:question_id'
  ,function(req,res,next)
  {
     if(check_login(req,res))next();
     else res.redirect('/login');
  }
  ,async function(req,res){routing.post_contest_question(req,res);})

   app.get('/contest/:contest_id/submissions/:submission_type'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');  
   }
   ,async function(req,res){routing.get_contest_submissions(req,res);});

   app.get('/contest/:contest_id/leaderboard'
   ,function(req,res,next)
   {
      if(check_login(req,res))next();
      else res.redirect('/login');
   }
   ,async function(req,res){routing.get_contest_leaderboard(req,res);});

   app.get('/logout',function(req,res){routing.get_logout(req,res);});

}





// C:\Users\HP\Desktop\typeorm_judge\typeorm_judge\app.js
// C:\Users\HP\Desktop\typeorm_judge\typeorm_judge\routing.js