const errorCodes = {
  validation: {
    EMAIL_IN_USE: "REGISTRATION_ERROR_001",
    EMAIL_FORMAT_ERROR: "REGISTRATION_ERROR_002",
    INVALID_CREDENTIALS: "LOGIN_ERROR_001",
    EMAIL_VERIFICATION_PENDING: "LOGIN_ERROR_002"
  },
  session: {
    LOGOUT_FAILED: "SESSION_ERROR_001"
  }
};

// The below can be offloaded to DB for configuration if needed.
export const errorMessages = {
  [errorCodes.validation.EMAIL_IN_USE]: "E-mail is already in use.",
  [errorCodes.validation.EMAIL_FORMAT_ERROR]:
    "format validation failed for email",
  [errorCodes.validation.INVALID_CREDENTIALS]: "Invalid credentials",
  [errorCodes.validation.EMAIL_VERIFICATION_PENDING]:
    "Email verification pending",
  [errorCodes.session.LOGOUT_FAILED]: "Logout failed due to unknown reason"
};

export default errorCodes;
