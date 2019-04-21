import { Error } from "../types/graphql-utils";
import { errorMessages } from "../constants/errors";
import { GenericError } from "./genericError";
class SystemError extends GenericError {
  constructor(error: Error) {
    super(SystemError.SYSTEM_ERROR);
    const message = errorMessages[error.code];
    this.result = {
      [error.path]: [
        {
          code: error.code,
          path: error.path,
          message: message ? message : error.code
        }
      ]
    };
  }
}

export default SystemError;
