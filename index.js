"use strict";

const Jokebot = require('./libs/jokebot');

const apiToken = process.env.botAPIKey;
let settings = {
    token: apiToken,
    name: "jokebot"
};

let jokebot = new Jokebot(settings);

jokebot.initialize();


