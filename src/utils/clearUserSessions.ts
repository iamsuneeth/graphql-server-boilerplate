import constants from "../constants";
import { Redis } from "ioredis";

const clearUserSessions = async (userId: string, redis: Redis) => {
  const sessions: string[] = await redis.lrange(
    `${constants.session.USER_SESSION_PREFIX}${userId}`,
    0,
    -1
  );
  const promises: Promise<Number>[] = [];
  sessions.forEach(sessionId => {
    promises.push(
      redis.del(`${constants.session.REDIS_SESSION_PREFIX}${sessionId}`)
    );
  });
  await Promise.all(promises);
};

export default clearUserSessions;
