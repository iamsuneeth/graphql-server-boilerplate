import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import ValidationError from "../../errors/validationError";
import errorCodes from "../../constants/errors";
import * as bcrypt from "bcryptjs";
import SystemError from "../../errors/SystemError";
import constants from "../../constants";

const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session }
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
      return true;
    },
    logout: (_, __, { session }) =>
      new Promise(resolve => {
        session.destroy(err => {
          if (err) {
            console.log(err);
            throw new SystemError({
              path: "session",
              code: constants.errors.session.LOGOUT_FAILED
            });
          }
          resolve(true);
        });
      })
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
