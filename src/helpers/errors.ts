import Boom from "@hapi/boom";

import { ApiErrorType, loginErrorType } from "~/config/apis/errors";

export const throwLoginError = () => {
  const error = Boom.unauthorized();
  error.output.payload.errorType = loginErrorType;
  throw error;
};

type CreateErrorBody =
  | {
      name: "invalidError";
      message: string;
    }
  | {
      name: "loginError";
    };

export const createErrorBody = (info: CreateErrorBody): ApiErrorType => {
  switch (info.name) {
    case "invalidError":
      return { errorType: "invalidError", message: info.message };
    case "loginError":
      return { errorType: "loginError" };
  }
};
