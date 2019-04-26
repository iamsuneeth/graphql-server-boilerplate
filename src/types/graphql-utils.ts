import { GraphQLFormattedError } from "graphql";
import { PrismaErrorProps } from "graphql-yoga/dist/defaultErrorFormatter";
import { Redis } from "ioredis";
import { Prisma } from "../../config/prisma/prisma-client/index";

export interface userSession extends Express.Session {
  userId: string;
}

export interface userSession extends Express.Session {
  userId: string;
}

export interface ResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      context: {
        redis: Redis;
        url: string;
        session: userSession;
        request: Express.Request;
        prisma: Prisma;
      },
      info: any
    ) => any;
  };
}

export interface Error {
  code: string;
  message?: string;
  path: string;
}

export interface result {
  [key: string]: Error[];
}

export interface formattedError
  extends GraphQLFormattedError,
    PrismaErrorProps {
  type: string;
  state: {
    [key: string]: Error[];
  };
}
