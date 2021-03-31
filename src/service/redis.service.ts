import { promisify } from "util";
import * as redis from "redis";

export default class RedisService {
  public client: redis.RedisClient;

  constructor(options: redis.ClientOpts) {
    this.client = redis.createClient(options);
  }

  get set() {
    return this.promisifyCommand(this.client.set);
  }

  get get() {
    return this.promisifyCommand(this.client.get);
  }

  get del() {
    return this.promisifyCommand(this.client.del);
  }

  get quit() {
    return this.promisifyCommand(this.client.quit);
  }

  get flushdb() {
    return this.promisifyCommand(this.client.flushdb);
  }

  get flushall() {
    return this.promisifyCommand(this.client.flushall);
  }

  promisifyCommand(command: any) {
    return promisify(command).bind(this.client);
  }
}
