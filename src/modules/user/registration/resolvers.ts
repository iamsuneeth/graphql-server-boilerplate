import { ResolverMap } from "../../../types/graphql-utils";
import constants from "../../../constants";
import * as yup from "yup";
import ValidationError from "../../../errors/validationError";
import { createUserEmailLink } from "../../../utils/createEmailLink";
import sendMail from "../../../utils/sendgrid";
import { hash } from "bcryptjs";

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
      { redis, url, prisma }
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
      const userExists = await prisma.user({
        email
      });
      if (userExists) {
        throw new ValidationError([
          { path: "email", code: constants.errors.validation.EMAIL_IN_USE }
        ]);
      }
      const user = await prisma.createUser({
        email,
        password: await hash(password, 10),
        name
      });
      sendMail(email, "Confirm email", "support@tsserver", "CREATE_USER", {
        link: await createUserEmailLink(url, user.id, redis),
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
