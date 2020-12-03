// let axios = require('axios');
// let cheerio = require('cheerio');
// let fs = require('fs'); 

// console.log("hi");

// axios.get('https://cricbuzz.com/')
//     .then((response) => {
//         if(response.status === 200) {
//         const html = response.data;
//             const $ = cheerio.load(html); 
//     }
//     }, (error) => console.log(err) );

// const siteUrl = "https://cricbuzz.com/";
// const fetchData = async () => {
//   const result = await axios.get(siteUrl);
//   console.log(result);
// //   return cheerio.load(result.data);
// };





// import "reflect-metadata";
// import {createConnection} from "typeorm";

// const express = require('express');  
// const app = express(); 
// const path=require('path').join(__dirname+'/views/');
// const bodyParser=require('body-parser');
// const routing=require('../routing.ts');
// const session = require('express-session');
// const cookie_parser=require('cookie-parser');
// import {getManager} from "typeorm";
// import {User} from "./entity/User";
// import {user_registration} from "./entity/user_registration";
// import {questions_table} from "./entity/questions_table";
// import {question_input_output} from "./entity/question_input_output";
// import {live_contests} from "./entity/live_contests";
// import {leaderboard} from "./entity/leaderboard";
// import {contests_users} from "./entity/contests_users";
// import {contest_question} from "./entity/contest_question";

// createConnection().then(async connection => {

//     app.use(bodyParser.urlencoded({ extended: true })); 
//     app.use(express.static('public'));
//     app.set('views',path);
//     app.set('view engine','pug');
//     app.listen(4000, function () {  console.log("Server listening.")  }); 
//     app.use(cookie_parser());

//     app.get('/',function(req,res){routing.get_signup(req,res);});

//     // console.log("Inserting a new user into the database...");
//     // const user = new User();
//     // user.firstName = "Timber";
//     // user.lastName = "Saw";
//     // user.age = 25;
//     // await connection.manager.save(user);
//     // console.log("Saved a new user with id: " + user.id);

//     // console.log("Loading users from the database...");
//     // const users = await connection.manager.find(User);
//     // console.log("Loaded users: ", users);

//     // console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));


// // C:\Users\HP\Desktop\typeorm_judge\typeorm_judge\src\index.ts`