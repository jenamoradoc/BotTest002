var builder = require('botbuilder');
var restify = require('restify');
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');
var express = require('express')

var app = express();

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: "1f7a5704-8dc9-4d9e-a92b-74f3e3f9df25" ,
    appPassword: "hbpsxsXNAPIDJ25019:)[z{"
});

var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer("1b89aa53e1a64b61a950c2d040c7c5de");
var intents = new builder.IntentDialog({
         recognizers: [recognizer]
});

bot.dialog('/',intents);

intents.matches('ams-welcome',[
    function(session,args){
        var city = builder.EntityRecognizer.findEntity(args.entities,'cities');
        if (city){
            var city_name = city.entity;
            var url = "http://api.apixu.com/v1/current.json?key=7dd32ec48606429db78111355162912&q=" + city_name;
            request(url,function(error,response,body){
                body = JSON.parse(body);
                temp = body.current.temp_c;
                session.send("It's " + temp + " degrees celsius in " + city_name);
            });
        }else{
            builder.Prompts.text(session, 'Which city do you want the weather for?');
        }
    },
    function(session,results){
        var city_name = results.response;
        var url = "http://api.apixu.com/v1/current.json?key=7dd32ec48606429db78111355162912&q=" + city_name;
            request(url,function(error,response,body){
                body = JSON.parse(body);
                temp = body.current.temp_c;
                session.send("It's " + temp + " degrees celsius in " + city_name);
        });
    }
]);

intents.matches('smalltalk.greetings',function(session, args){
    var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    if (fulfillment){
        var speech = fulfillment.entity;
        session.send(speech);
    }else{
        session.send('Sorry...not sure how to respond to that');
    }
});

intents.onDefault(function(session){
    session.send("Sorry...can you please rephrase?");
});

//ping
server.get('/ping', function (req, res, next) {
   res.send('pong' );
   next();
});
