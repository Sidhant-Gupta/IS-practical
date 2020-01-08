const path=require('path').join(__dirname+'/views/');
const pg=require('pg');
const database_connection_info = "postgres://admin_rajat:sql_root@localhost:5432/temp_online_judge";
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
    get_logout:get_logout,
    get_contest:get_contest,
    get_error:get_error
}

function get_signup(req,res)
{
    if(req.cookies.user_info)res.redirect('/livecontests');
    else res.render('signup',{errors:{}});
}

function post_signup(req,res)
{
    let username=req.body.username;
    let password=req.body.password;
    let errors=[];

    db_client.query("select * from user_registeration where username=$1",[username],function(db_err,db_res)
    {
        if(db_err){res.render('error404');}
        else
        {
            if(db_res.rows.length>0)errors.push({error:'Username Already Taken!.'}); 
            if(errors.length==0)
            {
                db_client.query("insert into user_registeration(username,password) values($1,$2)",[username,password],function(db_err,db_res)
                {
                    if(db_err)res.render('error404');   
                    else res.redirect('/login');
                });
            }
            else res.render('signup',{errors:errors});
        }
    });
}

function get_login(req, res) {res.render('login',{errors:{}});}

function post_login(req,res)
{
    let username=req.body.username;
    let password=req.body.password;
    errors=[]
    db_client.query("select * from user_registeration where username=$1 and password=$2",[username,password],function(db_err,db_res)
    {
        if(db_err)res.render('error404');
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
                let user_info={username:username,jwt_token:jwt_token}
                res.cookie('user_info',user_info);
                res.redirect('/livecontests');
            }
        }
        
    });
    
}

function get_livecontests(req,res)
{
    db_client.query("select * from live_contests",function(db_err,db_res)
    {
        if(db_err)res.render('error404');
        else 
        {
            let livecontests=db_res.rows;
            let user_info=req.cookies.user_info;
            res.render('livecontests',{livecontests:livecontests,user_info:user_info});
        }
    });    
}
     
function get_contest(req,res)
{
    if(req.cookies.user_info)
    {
        let contest_id=req.params.contest_id;
        db_client.query("select question_id from contest_question where contest_id=$1",[contest_id],function(db_err,db_res)
        {
            if(db_err)res.render('error404');
            else
            {
                if(db_res.rows.length==0)res.render('error404');
                else
                {
                    let q_ids=[];for(let i=0;i<db_res.rows.length;i++)q_ids.push(db_res.rows[i].question_qid);
                    db_client.query("select * from questions_table where id=any($1)",[q_ids],function(db_err,db_res)
                    {
                        if(db_err)res.render('error404');
                        else
                        {

                        }
                    });
                }
            }
        });

    }
    
}

function get_error(req,res)
{
    res.render('error404');
}
function get_logout(req,res)
{
    res.clearCookie('user_info');
    res.redirect('/login');
}
    
        
    

