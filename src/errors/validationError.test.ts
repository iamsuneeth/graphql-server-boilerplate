import ValidationError from "./validationError";
import constants from "../constants";
import { errorMessages } from "../constants/errors";

describe("Validation error tests", () => {
  test("create validation error", () => {
    const error = new ValidationError([
      { path: "email", code: constants.errors.validation.EMAIL_IN_USE }
    ]);
    expect(error).toBeDefined();
    expect(error.result).toMatchObject({
      email: [
        {
          code: constants.errors.validation.EMAIL_IN_USE,
          path: "email",
          message: errorMessages[constants.errors.validation.EMAIL_IN_USE]
        }
      ]
    });
  });
});
