import { GraphQLError, GraphQLFormattedError } from "graphql";
import { GenericError } from "../errors/genericError";
import {
  defaultErrorFormatter,
  PrismaErrorProps
} from "graphql-yoga/dist/defaultErrorFormatter";
import { formattedError } from "../types/graphql-utils";

export const formatError = (
  error: GraphQLError
): formattedError | GraphQLFormattedError & PrismaErrorProps => {
  if (error.originalError && error.originalError instanceof GenericError) {
    return {
      ...defaultErrorFormatter(error),
      type: error.originalError.type,
      state: error.originalError.result
    };
  }
  return {
    ...defaultErrorFormatter(error),
    type: "INTERNAL_SERVER_ERROR"
  };
};
