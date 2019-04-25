const errorCodes = {
  validation: {
    EMAIL_IN_USE: "REGISTRATION_ERROR_001",
    EMAIL_FORMAT_ERROR: "REGISTRATION_ERROR_002",
    INVALID_CREDENTIALS: "LOGIN_ERROR_001",
    EMAIL_VERIFICATION_PENDING: "LOGIN_ERROR_002",
    PASSWORD_VERIFICATION_LINK_WRONG: "PASSWORD_ERROR_001",
    USER_LOCKED: "LOGIN_ERROR_003"
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
  [errorCodes.session.LOGOUT_FAILED]: "Logout failed due to unknown reason",
  [errorCodes.validation.PASSWORD_VERIFICATION_LINK_WRONG]: "Expired Link",
  [errorCodes.validation.USER_LOCKED]: "User is locked."
};

export default errorCodes;
