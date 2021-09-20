import express from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { connectDB } from './db.js';
import { User } from './user.model.js';
import { isAuth } from './auth.js'
import { JWT_SECRET } from './config.js';

const app = express();

app.use(express.json());

app.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Hi"
    });
})

app.post("/signup", async (req, res, next) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    // let's make use of bcrypt to hash
    let hashedPassword = await hash(password, 10);

    let newUser = new User({
        name: name,
        email: email,
        password: hashedPassword
    })

    try {
        let user = await newUser.save();
        user = user.toObject();
        let { password, ...userWithoutPass } = user;

        console.log(userWithoutPass);

        res.status(201).json({
            message: "Account created",
            user: userWithoutPass
        })

    } catch (error) {
        console.log(error.toString());

        // 
        res.status(400).json({
            message: "error on creating account."
        })
    }


})

app.post("/login", (req, res, next) => {

    let email = req.body.email;
    let password = req.body.password;

    //now we will get the user, then compare the hashedPassword (saved in DB)
    // with currently provided password
    User.findOne({ email: email }).lean().then(async user => {
        if (user) {

            let passwordMatched = await compare(password, user.password);

            if (passwordMatched) {
                // email and password matched

                let { password, ...userWithoutPass } = user;


                let token = jwt.sign({ user: userWithoutPass }, JWT_SECRET, {
                    expiresIn: '7d' // expressed in seconds or a string describing a time span https://github.com/zeit/ms.js.
                })


                res.status(200).json({
                    message: "Login Success",
                    token: token,
                    user: userWithoutPass
                });
            } else {

                //password did not match
                res.status(403).json({
                    message: "Email and password did not match.",
                });
            }

        } else {

            //user not found associated with that mail
            res.status(403).json({
                message: "Email and password did not match.",
            });

        }
    })
})


app.get("/me", isAuth, (req, res, next) => {
    let user = req.user;
    User.findOne({ _id: user._id }).lean().then(user => {

        delete user.password;

        res.status(200).json({
            message: "User Profile",
            user
        })
    })
})


connectDB().then(db => {
    console.log("Start a server");

    app.listen(8080);
    console.log("Server started at 8080");
})