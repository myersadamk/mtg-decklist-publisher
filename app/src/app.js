var express = require('express');
var bodyParser = require('body-parser');
var _a = require('./modules/deckstats-client'), getFirstDeck = _a.getFirstDeck, getDeckLists = _a.getDeckLists;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
var redisClient = require('redis').createClient(6379, 'redis');
getFirstDeck(redisClient);
//
// client.on('connect', () => {
//   console.log('connected, bro');
//   client.get('key', (error, value) => {
//     console.log('here is ur key ' + value);
//   });
//   // client.set('key', 'my test value', redis.print);
// });
// getDeckLists();
app.listen(3000);
