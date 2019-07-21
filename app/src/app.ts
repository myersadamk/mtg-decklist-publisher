import Express, {RequestHandler} from 'express';
import * as BodyParser from 'body-parser'
import {createClient, RedisClient} from 'redis'

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
  // createClient(6379, 'redis')
  createClient(6379, '192.168.99.100')
).listen(3000);
