const errorCodes = {
  validation: {
    EMAIL_IN_USE: "VALIDATION_ERROR_001",
    EMAIL_FORMAT_ERROR: "VALIDATION_ERROR_002"
  }
};

// The below can be offloaded to DB for configuration if needed.
export const errorMessages = {
  [errorCodes.validation.EMAIL_IN_USE]: "E-mail is already in use.",
  [errorCodes.validation.EMAIL_FORMAT_ERROR]:
    "format validation failed for email"
};

export default errorCodes;
