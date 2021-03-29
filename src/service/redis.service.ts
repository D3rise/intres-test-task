import * as redis from "redis";

export default class RedisService {
  public client: redis.RedisClient;

  constructor(options: redis.ClientOpts) {
    this.client = redis.createClient(options);
  }
}
