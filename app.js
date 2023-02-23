import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import sessions from 'express-session'
import msIdExpress from 'microsoft-identity-express'
const appSettings = {
    appCredentials: {
        clientId:  "0a06c2d0-f4e0-4171-a7c1-4c3e47171f41",
        tenantId:  "f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
        clientSecret:  "9SC8Q~tiEnAS8QXYmhZC-XfQiHIHZl0qjGkp7di~"
    },	
    authRoutes: {
        redirect: "http://mwoode.com/redirect", //note: you can explicitly make this "localhost:3000/redirect" or "examplesite.me/redirect"
        error: "/error", // the wrapper will redirect to this route in case of any error.
        unauthorized: "/unauthorized" // the wrapper will redirect to this route in case of unauthorized access attempt.
    }
};

import models from "./models.js";

import apiV1Router from './routes/api/v1/apiv1.js';
import apiV2Router from './routes/api/v2/apiv2.js';
import apiV3Router from './routes/api/v3/apiv3.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { ppid } from 'process';

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

const msid = new msIdExpress.WebAppAuthClientBuilder(appSettings).build()
app.use(msid.initialize())

app.use((req, res, next) => {
    req.models = models
    next();
})

app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);
app.use('/api/v3', apiV3Router);

app.get('/signin', 
    msid.signIn({postLoginRedirect: '/'})
)

app.get('/signout',
    msid.signOut({postLogoutRedirect: '/'})
)

app.get('/error', (req, res) => {
    res.status(500).send("Error: Server error")
})

app.get('/unauthorized', (req, res) => {
    res.status(401).send("Error: Unauthorized")
})

export default app;
