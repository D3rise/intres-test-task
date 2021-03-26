import { RedisClient, ClientOpts, createClient } from "redis";

export default class Redis extends RedisClient {
  constructor(options: ClientOpts) {
    super(options);
    this.once("ready", () => {});
  }
}
