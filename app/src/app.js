const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

// const redis = require('redis');
// const client = redis.createClient(6379, 'redis');
//
// client.on('connect', () => {
//   console.log('connected, bro');
//   client.get('key', (error, value) => {
//     console.log('here is ur key ' + value);
//   });
//   // client.set('key', 'my test value', redis.print);
// });

const getDeckLists = require('./modules/deckstats-client');
getDeckLists();

app.listen(3000);
