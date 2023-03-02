import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import bcrypt from "bcrypt";

import sessions from 'express-session'

import models from "./models.js";

import apiV1Router from './routes/api/v1/apiv1.js';
import apiV2Router from './routes/api/v2/apiv2.js';
import apiV3Router from './routes/api/v3/apiv3.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24
app.use(sessions({
    secret: "this is some secret key I am making up 09532poi fn4eelhu jfcbds",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: false
}))

app.use((req, res, next) => {
    req.models = models
    next();
})

app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);
app.use('/api/v3', apiV3Router);

app.post("/login", async (req, res) => {
    console.log(req.body);
    if (req.body && req.body["email"] && req.body["pass"]) {
        let user = await req.models.Auth.findOne({"email": req.body["email"]});
        if (user) {
          try {
            if (await bcrypt.compare(req.body["pass"], user["password"])) {
                req.session.userId = user["_id"];
                req.session.username = user["email"];
                req.session.isAuthenticated = true;
        
                res.type('text').send(user["_id"]);
                } else {
                res.type('text').status(404).send("Wrong password!");
                }
            } catch (err) {
                res.type('text').status(500).send("There was an error on the server!")
            }
        } else {
            res.type('text').status(401).send("This account isn't registered yet!");
        }
    } else {
        res.type('text').status(400).send("Missing necessary user input!");
    }
});

app.post("/register", async (req, res) => {
    if (req.body && req.body["email"] && req.body["pass"]) {
        try {
            let hashedPass = await bcrypt.hash(req.body["pass"], 10);
            let newAuth = new req.models.Auth({
            "email": req.body["email"],
            "password": hashedPass,
            });
        
            await newAuth.save();

            req.session.userId = newAuth["_id"];

            let newUserInfo = new req.models.Users({
                "email": req.body["email"]
            })

            await newUserInfo.save();

            res.type('text').send("Success!");
        } catch (err) {
            console.log(err);
            res.type('text').status(500).send("There was an error on the server")
        }
    } else {
        res.type('text').status(400).send("Missing necessary user input!");
    }
});

app.post("/logout", async (req, res) => {
    if (!req.session.userid) {
        req.session.destroy();
        res.type('text').send("Success");
    } else {
        res.type('text').status(400).send("You aren't logged in.");
    }
});

export default app;
