const path = require('path').join(__dirname + '/views/');
const pg = require('pg');
const database_connection_info = "postgres://postgres:13579@localhost:5432/demo";;
const db_client = new pg.Client(database_connection_info);
const jwt = require('jsonwebtoken');
const jwt_secret_key = 'admin_sid';
const axios = require('axios');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSalt(8);

db_client.connect();

module.exports =
{
    get_signup: get_signup,
    post_signup: post_signup,
    get_login: get_login,
    post_login: post_login,
    get_livecontests: get_livecontests,
    get_logout: get_logout,
    get_contest: get_contest,
    get_start_contest: get_start_contest,
    get_contest_question: get_contest_question,
    post_contest_question: post_contest_question,
    get_contest_submissions: get_contest_submissions,
    get_contest_leaderboard: get_contest_leaderboard
}

var caesarShift = function (str, amount) {
    // Wrap the amount
    if (amount < 0) {
        return caesarShift(str, amount + 26);
    }

    // Make an output variable
    var output = "";

    // Go through each character
    for (var i = 0; i < str.length; i++) {
        // Get the character we'll be appending
        var c = str[i];

        // If it's a letter...
        if (c.match(/[a-z]/i)) {
            // Get its code
            var code = str.charCodeAt(i);

            // Uppercase letters
            if (code >= 65 && code <= 90) {
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            }

            // Lowercase letters
            else if (code >= 97 && code <= 122) {
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }

        // Append
        output += c;
    }

    // All done!
    return output;
};

function CaesarDecryption(encryptedString, unshiftAmount) {
    var plainText = "";
    for (var i = 0; i < encryptedString.length; i++) {
        var encryptedCharacter = encryptedString.charCodeAt(i);
        if (encryptedCharacter >= 97 && encryptedCharacter <= 122) {
            plainText += String.fromCharCode((encryptedCharacter - 97 - unshiftAmount + 26) % 26 + 97);
        } else if (encryptedCharacter >= 65 && encryptedCharacter <= 90) {
            plainText += String.fromCharCode((encryptedCharacter - 65 - unshiftAmount + 26) % 26 + 65);
        } else {
            plainText += String.fromCharCode(plainCharacter);
        }
    }
    return plainText;
}

function RF_encryption(s) {
    let len = s.length;
    let encString = "";
    for (let i = 0; i < len; i += 2) {
        encString += s[i];
    }

    for (let i = 1; i < len; i += 2) {
        encString += s[i];
    }
    return encString;
}

function RF_decryption(s) {
    let len = s.length;
    let secHalf = len % 2 != 0 ? Math.floor(len / 2) + 1 : Math.floor(len / 2);

    let i = 0; let ind = secHalf; let dec = "";
    console.log(secHalf);
    while (i < secHalf) {
        dec += s[i];
        if (ind < len)
            dec += s[ind];
        i++; ind++;

    }
    return dec;
}


function get_signup(req, res) { res.render('signup', { errors: {} }); }

async function post_signup(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    var salt = await bcrypt.genSalt(8);
    console.log(salt);

    let rand = Math.floor(Math.random() * 10);
 
    var hashedPassword;
    if (rand == 0){
        hashedPassword = caesarShift(password, 3)+"0";
        console.log("Encrypted Using Caesar Cipher-Substitution");
    }
    else if (rand == 1){
        hashedPassword = RF_encryption(username)+"1";
        console.log("Encrypted Using Rail Fence-Transposition");
    }
    else{
        hashedPassword = bcrypt.hashSync(password, salt)+"2";
        console.log("Encrypted Using DES");
    }
 
    console.log(hashedPassword);

    let errors = [];

    // const registered_users = await getManager()
    // .createQueryBuilder(username, "user_registeration")
    // .where("user_registeration.id = :id", { id: 1 });
    // console.log(registered_users);


    db_client.query("select * from user_registeration where username=$1", [username], function (db_err, db_res) {
        if (db_err) { console.log("helloooo"); res.render('error404'); }
        else {
            if (db_res.rows.length > 0) errors.push({ error: 'Username Already Taken!.' });
            if (errors.length == 0) {
                db_client.query("insert into user_registeration(username,password) values($1,$2)", [username, hashedPassword], function (db_err, db_res) {
                    if (db_err) res.render('error404');
                    else res.redirect('/login');
                });
            }
            else {
                console.log("hello");
                res.render('signup.pug', { errors: errors });
            }
        }
    });
}

function get_login(req, res) { res.render('login', { errors: {} }); }

async function post_login(req, res) {

    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;


    let errors = []; let isValid;
    db_client.query("select * from user_registeration where username=$1", [username], function (db_err, db_res) {
        if (db_err) res.render('error404');
        else {
            let i, count = 0;
            for (i = 0; i < db_res.rows.length; i++) {
                let hpassword = db_res.rows[i].password;
                console.log(hpassword);
                let hashPassword=hpassword.substring(0,hpassword.length-1);
                let encType=hpassword[hpassword.length-1];
                // let encType=1;
                let decPassword;
                if(encType==0){
                    decPassword=CaesarDecryption(hashPassword,3);
                    if(decPassword===password)isValid=true;
                }
                else if(encType==1){
                    decPassword=RF_decryption(hashPassword);
                    console.log(decPassword);
                    if(decPassword===password)isValid=true;
                }
                else{
                    isValid = bcrypt.compareSync(password, hashPassword);
                }
                
                if (isValid) { count++; }
                console.log(count);
                if (count === 0 || count > 1) { errors.push({ error: 'Invalid Credentials!.' }); res.send("INVALID CREDENTIALS"); }
                else {
                    let id = db_res.rows[0].id;
                    let jwt_token = jwt.sign({ username: username }, jwt_secret_key);
                    let user_info = { id: id, username: username, jwt_token: jwt_token }
                    console.log(jwt_token);
                    res.cookie('user_info', user_info);
                    // res.send("LOGGED IN");
                    res.redirect('/livecontests');
                }
            }
        }
    });
}

function get_livecontests(req, res) {
    db_client.query("select * from live_contests", function (db_err, db_res) {
        if (db_err) res.render('error404');
        else {
            let user_info = req.cookies.user_info;
            let livecontests = db_res.rows;
            res.render('livecontests', { livecontests: livecontests, user_info: user_info });
        }
    });
}

async function get_contest(req, res) {
    let contest_id = req.params.contest_id;
    try {
        let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
        if (contest_info.rows.length == 0) throw exception;
        else {
            contest_info = contest_info.rows[0];
            let user_info = req.cookies.user_info;
            res.render('contest', { user_info: user_info, contest_info: contest_info });
        }
    }
    catch (e) { res.render('error404'); }

}

async function get_start_contest(req, res) {
    try {
        let user_info = req.cookies.user_info;
        let contest_id = req.params.contest_id;
        let valid_user = await db_client.query("select * from contests_users where user_id=$1 and contest_id=$2", [user_info.id, contest_id]);


        let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
        contest_info = contest_info.rows[0];

        if (valid_user.rows.length != 0 && check_time(valid_user.rows[0].enter_time, contest_info.duration)) { throw exception; }
        else {
            await db_client.query("begin");
            if (valid_user.rows.length == 0) { await db_client.query("insert into contests_users(user_id,contest_id,enter_time) values($1,$2,$3)", [user_info.id, contest_id, new Date()]); }

            let q_ids_query = await db_client.query("select question_id from contest_question where contest_id=$1", [contest_id]);
            let q_ids = [];
            for (let i = 0; i < q_ids_query.rows.length; i++) { q_ids.push(q_ids_query.rows[i].question_id); };

            let questions = await db_client.query("select * from questions_table where id=any($1)", [q_ids]);
            questions = questions.rows;

            await db_client.query("commit");
            res.render('questions', { user_info: user_info, contest_info: contest_info, questions: questions });
        }

    }
    catch (e) { res.render('error404'); }
}

async function get_contest_question(req, res) {
    try {
        let user_info = req.cookies.user_info;
        let contest_id = req.params.contest_id;
        let question_id = req.params.question_id;
        let valid_user = await db_client.query("select user_id from contests_users where user_id=$1 and contest_id=$2", [user_info.id, contest_id]);
        let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
        contest_info = contest_info.rows[0];
        if (valid_user.rows.length != 1) throw exception;
        else if (check_time(valid_user.rows[0].enter_time, contest_info.duration)) throw exception;
        else {
            let valid_question = await db_client.query("select * from contest_question where contest_id=$1 and question_id=$2", [contest_id, question_id]);
            if (valid_question.rows.length != 1) throw exception;
            else {
                let question_info = await db_client.query("select * from questions_table where id=$1", [question_id]);
                question_info = question_info.rows[0];
                res.render('single_question', { user_info: user_info, contest_info: contest_info, question_info: question_info, result: " " });
            }
        }
    }
    catch (e) { res.render('error404'); }
}

async function post_contest_question(req, res) {
    try {
        let user_info = req.cookies.user_info;
        let contest_id = req.params.contest_id;
        let question_id = req.params.question_id;
        let valid_question = await db_client.query("select * from contest_question where contest_id=$1 and question_id=$2", [contest_id, question_id]);
        let valid_user = await db_client.query("select user_id from contests_users where user_id=$1 and contest_id=$2", [user_info.id, contest_id]);
        if (valid_user.rows.length != 1) throw exception;
        else if (check_time(valid_user.rows[0].enter_time, contest_info.duration)) throw exception;
        else if (valid_question.rows.length != 1) throw exception;
        else {
            db_client.query("begin");

            let source_code = req.body.source_code;
            let test_case = await db_client.query("select * from question_input_output where question_id=$1", [question_id]);
            let input = test_case.rows[0].input;
            let output = test_case.rows[0].output;
            let compiler = { source_code: source_code, stdin: input, expected_output: output, language_id: 48 };

            let question_info = await db_client.query("select * from questions_table where id=$1", [question_id]);
            question_info = question_info.rows[0];
            let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
            contest_info = contest_info.rows[0];

            await axios
                ({
                    method: 'post',
                    url: 'https://api.judge0.com/submissions',
                    headers: { 'Content-Type': 'application/JSON' },
                    data: compiler
                })
                .then
                (async function (response) {
                    await axios
                        ({
                            method: 'get',
                            url: 'https://api.judge0.com/submissions/' + response.data.token,
                        })
                        .then
                        (async function (response) {
                            let result = response.data.status.description;
                            if (result) {
                                db_client.query("insert into leaderboard(user_id,contest_id,question_id,score) values($1,$2,$3,$4)", [user_info.id, contest_id, question_id, result], function (db_err, db_res) {
                                    if (db_err) res.render('error404');
                                    else {
                                        db_client.query("commit");
                                        res.render('single_question', { user_info: user_info, contest_info: contest_info, question_info: question_info, result: result })
                                    }
                                });

                            }
                        })
                        .catch
                        (error => {
                            res.render('single_question', { user_info: user_info, contest_info: contest_info, question_info: question_info, result: 'ERROR IN CODE' })
                        });
                })
                .catch
                (error => {
                    res.render('single_question', { user_info: user_info, contest_info: contest_info, question_info: question_info, result: 'SERVER ERROR' })
                });
        }
    }
    catch (e) { res.render('error404'); }
}

async function get_contest_submissions(req, res) {
    try {
        let contest_id = req.params.contest_id;
        let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
        if (contest_info.rows.length == 0) throw exception;
        else {
            let contest_submissions = {};
            let submission_type = req.params.submission_type;
            if (submission_type == 1) contest_submissions = await db_client.query("select user_id,username,question_id,score from user_registeration inner join submissions on user_registeration.id=submissions.user_id where contest_id=$1;", [contest_id]);
            else if (submission_type == 2) {
                let user_id = req.cookies.user_info.id;
                contest_submissions = await db_client.query("select user_id,username,question_id,score from user_registeration inner join submissions on user_registeration.id=submissions.user_id where contest_id=$1 and user_id=$2;", [contest_id, user_id]);
            }
            else throw exception;
            res.render('submissions', { contest_submissions: contest_submissions.rows, contest_info: contest_info.rows[0] });
        }
    }
    catch (e) { res.render('error404'); }
}


async function get_contest_leaderboard(req, res) {
    try {

        let contest_id = req.params.contest_id;
        let contest_info = await db_client.query("select * from live_contests where id=$1", [contest_id]);
        if (contest_info.rows.length == 0) throw exception;
        else {
            let contest_ranks = await db_client.query("select user_id,username,countx from (select user_id,count(distinct(question_id)) as countx from submissions where score='Accepted' and contest_id=$1 group by user_id)inner_query inner join user_registeration on user_registeration.id=inner_query.user_id order by countx desc", [contest_id]);
            if (contest_ranks.rows.length == 0) throw exception;
            else {
                res.render('leaderboard', { contest_ranks: contest_ranks.rows, contest_info: contest_info.rows[0] });
            }
        }
    }
    catch (e) { console.log(e); res.render('error404'); }
}
function check_time(user_time, contest_duration) {
    let diff = (Date.now() - user_time) / (1000 * 60 * 60);
    if (diff > contest_duration) return true;
    return false;
}

function get_logout(req, res) {
    console.log("in logout");
    res.clearCookie('user_info');
    res.redirect('/login');
}




async function get_contest_q1() {
    return new Promise((resolve, reject) => {
        let res = {};
        db_client.query("select * from user_registeration", function (db_err, db_res) {
            if (!db_err) {
                console.log('Here');
                res = db_res.rows;
                resolve(res);
            } else {
                reject(db_err);
            }
        });
    });
}