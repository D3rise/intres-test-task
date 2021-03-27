import * as redis from "redis";

export default class Redis {
  public client: redis.RedisClient;

  constructor(options: redis.ClientOpts) {
    this.client = redis.createClient(options);
  }
}
