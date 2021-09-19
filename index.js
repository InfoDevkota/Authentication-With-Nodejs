import express from 'express';
import session from 'express-session'

import path from 'path';

import { connectDB } from './db.js';
import { User } from './user.model.js';
import { isAuth } from './auth.js'

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));
app.use("/static", express.static(path.join(path.resolve(), 'static')));

app.use(express.urlencoded({
    extended: true
}));

app.use(session({
    secret: "aSecret-UseENV",
    resave: false,
    saveUninitialized: false
}))

app.get("/", (req, res, next) => {
    //if a user is logined, the user in session is defined
    let user = req.session.user;
    res.render('home', {
        user: user
    });
})
app.get("/login", (req, res, next) => {
    res.render('login');
})
app.get("/signup", (req, res, next) => {
    res.render('signup');
})

app.post("/login", (req, res, next) => {

    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email, password: password }).then(user => {
        if (user) {

            //let's save the user in the session
            req.session.user = user;

            res.render('login-result', {
                message: "Login Success",
                message2: false,
                success: true
            });
        } else {
            res.render('login-result', {
                message: "Login Failed",
                message2: "Email and password did not match.",
                success: false
            });

        }
    })
})
app.post("/signup", async (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    let newUser = new User({
        name: name,
        email: email,
        password: password
    })
    try {
        let user = await newUser.save();

        res.render('signup-result', {
            user: user,
            message: "Account Created",
            message2: false,
            success: true
        });

    } catch (error) {

        res.render('signup-result', {
            message: "Account Creation Failed",
            message2: 'The Email may have been already used.',
            success: false
        });
    }


})

app.get("/me", isAuth, (req, res, next) => {
    let user = req.session.user;
    res.render('me', {
        user: user
    });
})


connectDB().then(db => {
    console.log("Start a server");

    app.listen(8080);
    console.log("Server started at 8080");
})