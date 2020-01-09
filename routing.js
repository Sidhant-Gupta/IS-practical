const path=require('path').join(__dirname+'/views/');
const pg=require('pg');
const database_connection_info = "postgres://admin_rajat:sql_root@localhost:5432/temp_online_judge";
const db_client= new pg.Client(database_connection_info);
const jwt = require('jsonwebtoken');
const jwt_secret_key='admin_rajat';
const axios=require('axios');

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
    get_start_contest:get_start_contest,
    get_contest_question:get_contest_question,
    post_contest_question:post_contest_question
}

function get_signup(req,res){res.render('signup',{errors:{}});}

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
                let id=db_res.rows[0].id;
                let jwt_token=jwt.sign({username:username},jwt_secret_key);
                let user_info={id:id,username:username,jwt_token:jwt_token}
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
            let user_info=req.cookies.user_info;
            let livecontests=db_res.rows;
            res.render('livecontests',{livecontests:livecontests,user_info:user_info});
        }
    });    
}

async function get_contest(req,res)
{
    let contest_id=req.params.contest_id;
    try
    {
        let contest_info=await db_client.query("select * from live_contests where id=$1",[contest_id]);
        if(contest_info.rows.length==0)throw exception;
        else
        {
            contest_info=contest_info.rows[0];
            let user_info=req.cookies.user_info;
            res.render('contest',{user_info:user_info,contest_info:contest_info});
        }
    }
    catch(e){res.render('error404'); }
     
}

async function get_start_contest(req,res)
{
    try
    {
        let user_info=req.cookies.user_info;
        let contest_id=req.params.contest_id;
        let valid_user=await db_client.query("select user_id from contests_users where user_id=$1 and contest_id=$2",[user_info.id,contest_id]);
        
        if(valid_user.rows.length!=0)throw exception;//CHECK TIME TOKEN
        else
        {
            await db_client.query("begin");
            await db_client.query("insert into contests_users(user_id,contest_id,enter_time) values($1,$2,$3)",[user_info.id,contest_id,new Date()]);
            
            let contest_info=await db_client.query("select * from live_contests where id=$1",[contest_id]);
            contest_info=contest_info.rows[0];
            let q_ids_query=await db_client.query("select question_id from contest_question where contest_id=$1",[contest_id]);
            let q_ids=[];
            for(let i=0;i<q_ids_query.rows.length;i++){q_ids.push(q_ids_query.rows[i].question_id);};

            let questions=await db_client.query("select * from questions_table where id=any($1)",[q_ids]);
            questions=questions.rows;

            await db_client.query("commit");
            res.render('questions',{user_info:user_info,contest_info:contest_info,questions:questions});
        }

    }
    catch(e){res.render('error404');}
}

async function get_contest_question(req,res)
{
    try
    {
        let user_info=req.cookies.user_info;
        let contest_id=req.params.contest_id;  
        let question_id=req.params.question_id;
        let valid_user=await db_client.query("select user_id from contests_users where user_id=$1 and contest_id=$2",[user_info.id,contest_id]);
        if(valid_user.rows.length!=1)throw exception;//CHECK TIME TOKEN
        else
        {
            let valid_question=await db_client.query("select * from contest_question where contest_id=$1 and question_id=$2",[contest_id,question_id]);
            if(valid_question.rows.length!=1)throw exception;
            else
            {
                let question_info=await db_client.query("select * from questions_table where id=$1",[question_id]);
                question_info=question_info.rows[0];
                let contest_info=await db_client.query("select * from live_contests where id=$1",[contest_id]);
                contest_info=contest_info.rows[0];
                res.render('single_question',{user_info:user_info,contest_info:contest_info,question_info:question_info,result:{}});
            }
        }
    }
    catch(e){res.render('error404');}
}

async function post_contest_question(req,res)
{
    try
    {
        let user_info=req.cookies.user_info;
        let contest_id=req.params.contest_id;  
        let question_id=req.params.question_id;
        let valid_question=await db_client.query("select * from contest_question where contest_id=$1 and question_id=$2",[contest_id,question_id]);
        if(valid_question.rows.length!=1)throw exception;
        else
        {
            db_client.query("begin");

            let source_code=req.body.source_code;
            let test_case=await db_client.query("select * from question_input_output where question_id=$1",[question_id]);
            let input=test_case.rows[0].input;
            let output=test_case.rows[0].output;
            let compiler={source_code:source_code,std_in:input,expected_output:output,language_id:48};

            let question_info=await db_client.query("select * from questions_table where id=$1",[question_id]);
            question_info=question_info.rows[0];
            let contest_info=await db_client.query("select * from live_contests where id=$1",[contest_id]);
            contest_info=contest_info.rows[0];

            axios
            ({
                method: 'post',
                url:'https://api.judge0.com/submissions',
                headers: { 'Content-Type': 'application/JSON' },
                data:compiler
            })
            .then
            (function(response)
            {
                axios
                ({
                    method: 'get',
                    url:'https://api.judge0.com/submissions/'+response.data.token,
                })
                .then
                (function(response)
                {
                    let result=response.data.status.description;
                    res.render('single_question',{user_info:user_info,contest_info:contest_info,question_info:question_info,result:result})
                })
                .catch
                (error =>
                {
                    res.render('single_question',{user_info:user_info,contest_info:contest_info,question_info:question_info,result:'ERROR IN CODE'})
                }); 
            })
            .catch
            (error => 
            {
                res.render('single_question',{user_info:user_info,contest_info:contest_info,question_info:question_info,result:'SERVER ERROR'})
            });
        }
    }
    catch(e){res.render('error404');}
}



function get_logout(req,res)
{
    res.clearCookie('user_info');
    res.redirect('/login');
}
    
        
    

// async function get_contest_q1()
// {
//     return new Promise((resolve, reject) => {
//         let res={};
//     db_client.query("select * from user_registeration",function(db_err,db_res)
//     {
//         if(!db_err)
//         {
//             console.log('Here');
//             res=db_res.rows;
//             resolve(res);
//         } else {
//             reject(db_err);
//         }
//     });
//     });
// }