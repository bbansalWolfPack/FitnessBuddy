var Botkit = require('botkit');
var apiai = require('apiai');
var app = apiai(process.env.APIAITOKEN);
var Slack = require('slack-node')
var request = require('request')
var service = require('./service.js')
var slack = new Slack(process.env.SLACKTOKEN)
