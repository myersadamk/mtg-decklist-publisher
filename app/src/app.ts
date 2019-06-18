import Express from 'express';
import * as BodyParser from 'body-parser'
import {createClient, RedisClient} from 'redis'

import {RequestHandler} from "express";

class App {
  private application: Express.Application;
  private redisClient: RedisClient;

  constructor(bodyDecoder: RequestHandler, redisClient: RedisClient) {
    this.application = Express();
    this.application.use(bodyDecoder);
    this.redisClient = redisClient;
  }

  public listen(port: Number): void {
    this.application.listen(port);
  }
}

new App(
  BodyParser.urlencoded({extended: false}),
  createClient(6379, 'redis')
).listen(3000);
