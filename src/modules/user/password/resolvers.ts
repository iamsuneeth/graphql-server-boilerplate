import { ResolverMap } from "../../../types/graphql-utils";
import ValidationError from "../../../errors/validationError";
import constants from "../../../constants";
import { User } from "../../../entity/User";
import { forgotPasswordEmailLink } from "../../../utils/createEmailLink";
import sendMail from "../../../utils/sendgrid";
import clearUserSessions from "../../../utils/clearUserSessions";
import * as bcrypt from "bcryptjs";

const resolvers: ResolverMap = {
  Mutation: {
    forgotPasswordChange: async (
      _,
      { password, id }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const userId = await redis.get(id);
      if (!userId) {
        throw new ValidationError([
          {
            path: "link",
            code: constants.errors.validation.PASSWORD_VERIFICATION_LINK_WRONG
          }
        ]);
      }
      await User.update(
        {
          id: userId
        },
        {
          password: await bcrypt.hash(password, 10),
          locked: false
        }
      );
      await redis.del(id);
      return true;
    },
    sendForgotPasswordEmailLink: async (_, __, { session, redis }) => {
      const user: User = <User>await User.findOne({
        id: session.userId
      });

      await sendMail(
        user.email,
        "Password Reset",
        "support@tsserver",
        "FORGOT_PASSWORD",
        {
          name: user.name,
          link: await forgotPasswordEmailLink(
            process.env.FRONTEND_HOST as string,
            session.userId,
            redis
          )
        }
      );

      await clearUserSessions(session.userId, redis);

      await User.update(
        {
          id: session.userId
        },
        {
          locked: true
        }
      );

      return true;
    }
  }
};

export default resolvers;
