import { GraphQLError } from "graphql";
import { result } from "../types/graphql-utils";

export class GenericError extends GraphQLError {
  type: string = "";
  result: result = {};
  static VALIDATION_ERROR = "validation";
  static SYSTEM_ERROR = "system";
  private static messages: { [key: string]: string } = {
    [GenericError.VALIDATION_ERROR]: "Validation error.",
    [GenericError.SYSTEM_ERROR]: "System error."
  };
  constructor(type: string = GenericError.SYSTEM_ERROR) {
    super(GenericError.messages[type]);
    this.type = type;

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    //Object.setPrototypeOf(this, GenericError.prototype);
  }
}
