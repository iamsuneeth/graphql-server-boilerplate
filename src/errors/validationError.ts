import { Error } from "../types/graphql-utils";
import { errorMessages } from "../constants/errors";
import { GenericError } from "./genericError";
import { result } from "../types/graphql-utils";

class ValidationError extends GenericError {
  constructor(errors: Error[]) {
    super(ValidationError.VALIDATION_ERROR);
    this.result = errors.reduce((result: result, error) => {
      const message = errorMessages[error.code];
      if (Object.prototype.hasOwnProperty.call(result, error.path)) {
        result[error.path].push({
          code: error.code,
          path: error.path,
          message: message ? message : error.code
        });
      } else {
        result[error.path] = [
          {
            code: error.code,
            path: error.path,
            message: message ? message : error.code
          }
        ];
      }
      return result;
    }, {});

    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    //Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export default ValidationError;
