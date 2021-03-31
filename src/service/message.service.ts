import RedisService from "./redis.service";

export default class MessageService {
  redis: RedisService;

  constructor(redis: RedisService) {
    this.redis = redis;
  }
}
