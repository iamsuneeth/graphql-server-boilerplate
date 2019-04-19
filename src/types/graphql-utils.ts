import { GraphQLFormattedError } from "graphql";
import { PrismaErrorProps } from "graphql-yoga/dist/defaultErrorFormatter";
import { Redis } from "ioredis";

export interface ResolverMap {
  [key: string]: {
    [key: string]: (
      parent: any,
      args: any,
      context: {
        redis: Redis;
        url: string;
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
