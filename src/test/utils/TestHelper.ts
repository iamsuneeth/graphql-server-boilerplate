import { prisma } from "../../../config/prisma/prisma-client";
import { hash } from "bcryptjs";
import { User } from "../../types/graphql-utils";

export const createUser = async (user: User) => {
  return prisma.createUser({
    ...user,
    password: await hash(user.password, 10)
  });
};
