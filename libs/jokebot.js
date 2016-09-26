"use strict";

const SlackBot = require('slackbots');
const request = require('request');

/**
 * A slack bot that outputs random jokes whenever it is mentioned ('@').
 */
class JokeBot extends SlackBot {

    constructor(settings) {
        super(settings);

        this.settings = settings;
        this.user = null;
    }


    /**
     * Initializes Jokebot
     */
    initialize() {

        this.on('start', this._onStart);
        this.on('message', this._onMessage);
    }


    /**
     * Runs when the Slack Real Time API has started
     * @private
     */
    _onStart() {

        console.log('Joke bot started');

        // sets the 'user' attribute to the 'bots' user object returned by the slack RTM API
        this.user = this.users.filter(user => user.name === this.settings.name)[0];
    }


    /**
     * Runs when a 'message' event is fired in the slack real time API
     * @private
     */
    _onMessage(event) {


        if (this._isMessage(event)
            && this._isChannelConversation(event)
            && this._isNotFromJokeBot(event)
            && this._isMentioningJokeBot(event)) {

            this._sendMessage(event);
        }
    }


    /**
     * Returns true if the slack event type is a message
     * @param event
     * @returns {boolean}
     * @private
     */
    _isMessage(event) {

        return event.type === 'message' && Boolean(event.text);
    }


    /**
     * Returns true if the event is triggered from a channel conversation
     * @param event
     * @returns {boolean}
     * @private
     */
    _isChannelConversation(event) {

        return typeof event.channel === 'string' &&
            event.channel[0] === 'C';

    }


    /**
     * Returns true if message sender is NOT jokebot
     * @param event
     * @returns {boolean}
     * @private
     */
    _isNotFromJokeBot(event) {

        return event.user !== this.user.id;
    }


    /**
     * Gets a random Joke string from the webknox API
     * @returns {Promise}
     * @private
     */
    _generateJokeMessage() {

        let jokePromise = new Promise((resolve, reject) => {

            request('http://tambal.azurewebsites.net/joke/random', function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    // params are  body.title, body.joke, body.category and body.rating
                    resolve(JSON.parse(body).joke);

                } else {
                    reject(error);
                }
            })
        });

        return jokePromise;
    }


    /**
     * Sends a reply message with a randomly generated joke (via the Slack RTM API)
     * @param lastEvent
     * @private
     */
    _sendMessage(lastEvent) {

        this._generateJokeMessage().then((jokeString) => {
            console.log(jokeString);
            let channel = this._getChannelById(lastEvent.channel);
            this.postMessageToChannel(channel.name, jokeString, {as_user: true});

        }, (error) => {

            console.error(error);
        });

        //todo: send a messgage via the slack api
    }


    /**
     * Returns a channel object that matches channelId
     * @param channelId
     * @returns {T|*}
     * @private
     */
    _getChannelById(channelId) {

        return this.channels.filter(function (item) {
            return item.id === channelId;
        })[0];
    }


    /**
     * Returns true if the event text mentions jokebot (@jokebot)
     * @param event
     * @returns {boolean}
     * @private
     */
    _isMentioningJokeBot(event) {

        return event.text.indexOf(this.user.id) > -1;
    }

}

module.exports = JokeBot;
