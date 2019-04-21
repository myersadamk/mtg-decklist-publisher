const express = require('express');
const bodyParser = require('body-parser');

const {getFirstDeck, getDeckLists} = require('./modules/deckstats-client');


const app = express();

app.use(bodyParser.urlencoded({extended: false}));

const redisClient = require('redis').createClient(6379, 'redis');

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
