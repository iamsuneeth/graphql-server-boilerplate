import { ResolverMap } from "../../../types/graphql-utils";
import ValidationError from "../../../errors/validationError";
import constants from "../../../constants";
import { forgotPasswordEmailLink } from "../../../utils/createEmailLink";
import sendMail from "../../../utils/sendgrid";
import clearUserSessions from "../../../utils/clearUserSessions";
import { hash } from "bcryptjs";

const resolvers: ResolverMap = {
  Mutation: {
    forgotPasswordChange: async (
      _,
      { password, id }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis, prisma }
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
      await prisma.updateUser({
        where: {
          id: userId
        },
        data: {
          password: await hash(password, 10),
          locked: false
        }
      });
      await redis.del(id);
      return true;
    },
    sendForgotPasswordEmailLink: async (_, __, { session, redis, prisma }) => {
      const user = await prisma.user({
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

      await prisma.updateUser({
        where: {
          id: session.userId
        },
        data: {
          locked: true
        }
      });

      return true;
    }
  }
};

export default resolvers;
