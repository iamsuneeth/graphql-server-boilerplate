import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import ValidationError from "../../errors/validationError";
import errorCodes from "../../constants/errors";
import * as bcrypt from "bcryptjs";
import constants from "../../constants";

const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, request }
    ) => {
      const user = await User.findOne({
        email
      });

      if (!user) {
        throw new ValidationError([
          {
            path: "email",
            code: errorCodes.validation.INVALID_CREDENTIALS
          }
        ]);
      }

      if (!user.confirmed) {
        throw new ValidationError([
          {
            path: "email",
            code: errorCodes.validation.EMAIL_VERIFICATION_PENDING
          }
        ]);
      }

      if (!(await bcrypt.compare(password, user.password))) {
        throw new ValidationError([
          {
            path: "email",
            code: errorCodes.validation.INVALID_CREDENTIALS
          }
        ]);
      }

      session.userId = user.id;
      if (request.sessionID) {
        await redis.lpush(
          `${constants.session.USER_SESSION_PREFIX}${user.id}`,
          request.sessionID
        );
      }

      return true;
    },
    logout: async (_, __, { session, redis }) => {
      const sessions: string[] = await redis.lrange(
        `${constants.session.USER_SESSION_PREFIX}${session.userId}`,
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
      return true;
    }
  },
  Query: {
    me: (_, __, { session }) => {
      if (!session.userId) {
        return {
          id: "anonymous",
          email: "anonymous",
          name: "anonymous"
        };
      }
      return User.findOne({
        id: session.userId
      });
    }
  }
};

export default resolvers;
