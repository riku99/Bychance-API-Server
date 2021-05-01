export type LoginError = { errorType: "loginError" };

export type InvalidError = { errorType: "invalidError"; message: string };

export type ApiErrorType = LoginError | InvalidError;

export const loginErrorType = "loginError";

export const invalidErrorType = "invalidError";
