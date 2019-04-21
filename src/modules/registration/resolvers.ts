import { ResolverMap } from "../../types/graphql-utils";
import { User } from "../../entity/User";
import constants from "../../constants";
import * as yup from "yup";
import ValidationError from "../../errors/validationError";
import createUserEmailLink from "../../utils/createUserEmailLink";
import sendMail from "../../utils/sendgrid";

const validations = yup.object().shape({
  email: yup
    .string()
    .email(constants.errors.validation.EMAIL_FORMAT_ERROR)
    .min(1)
    .max(255)
});

const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await validations.validate(args, { abortEarly: false });
      } catch (error) {
        throw new ValidationError(
          error.inner.map(({ path, message }: yup.ValidationError) => ({
            path,
            code: message
          }))
        );
      }
      const { email, password, name } = args;
      const userExists = await User.findOne({
        where: {
          email
        },
        select: ["id"]
      });
      if (userExists) {
        throw new ValidationError([
          { path: "email", code: constants.errors.validation.EMAIL_IN_USE }
        ]);
      }
      const user = User.create({
        email,
        password,
        name
      });
      await user.save();
      sendMail(email, {
        confirmation_link: await createUserEmailLink(url, user.id, redis),
        name
      });
      return true;
    }
  },
  Query: {
    isRegistered: () => true
  }
};

export default resolvers;
