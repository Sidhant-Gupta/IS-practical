const path=require('path').join(__dirname+'/views/');
const pg=require('pg');
const database_connection_info = "postgres://admin_rajat:sql_root@localhost:5432/online_judge";
const db_client= new pg.Client(database_connection_info);
const jwt = require('jsonwebtoken');
const jwt_secret_key='admin_rajat'
db_client.connect();





module.exports=
{
    get_signup:get_signup,
    post_signup:post_signup,
    get_login:get_login,
    post_login:post_login,
    get_livecontests:get_livecontests,
    get_logout:get_logout
}

function get_signup(req,res)
{
    res.render('signup',{errors:{}});
}

function post_signup(req,res)
{
    let username=req.body.username;
    let password=req.body.password;
    let errors=[];

    db_client.query("select * from user_registeration where username=$1",[username],function(db_err,db_res)
    {
        if(db_err)errors.push({error:'Internal Error!.'});
        else if(db_res.rows.length>0)errors.push({error:'Username Already Taken!.'}); 

        if(errors.length==0)
        {
            db_client.query("insert into user_registeration(username,password) values($1,$2)",[username,password],function(db_err,db_res)
            {
               if(db_err)
               {
                   errors.push({error:'Internal Error!.'});
                   res.render('signup',{errors:errors});   
               }
               else res.redirect('/login');
            });
        }
        else res.render('signup',{errors:errors});
    });
}

function get_login(req, res) 
{
    res.render('login',{errors:{}});
}

function post_login(req,res)
{
    let username=req.body.username;
    let password=req.body.password;
    errors=[]
    db_client.query("select * from user_registeration where username=$1 and password=$2",[username,password],function(db_err,db_res)
    {
        if(db_err)
        {
            errors.push({error:'Internal Error!.'});
            res.render('login',errors);
        }
        else
        {
            if(db_res.rows.length!=1)
            {
                errors.push({error:'Invalid Credentials!.'});
                res.render('login',errors);
            }
            else 
            {
                let jwt_token=jwt.sign({username:username},jwt_secret_key);
                let user_info={username:username,password:password,jwt_token:jwt_token}
                res.cookie('user_info',user_info);
                res.redirect('livecontests');
            }
        }
        
    });
    
}

function get_livecontests(req,res)
{
    if(req.cookies.user_info)
    {
        let livecontests=[];
        livecontests.push({id:1,name:'Long Challenge'});
        livecontests.push({id:2,name:'LunchTime'});
        livecontests.push({id:3,name:'CookOff'});
        res.render('livecontests',{livecontests:livecontests});
    }
    else res.redirect('/login');
}
     
function get_logout(req,res)
{
    console.log('LOGOUT');
    res.clearCookie('user_info');
    res.redirect('/login');
}
    
        
    

