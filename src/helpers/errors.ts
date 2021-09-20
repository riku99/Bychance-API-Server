import Boom from "@hapi/boom";

import { loginErrorType, invalidErrorType } from "~/config/apis/errors";

export const throwLoginError = () => {
  const error = Boom.unauthorized();
  error.output.payload.errorType = loginErrorType;
  throw error;
};

export const throwInvalidError = (
  message: string = "無効なリクエストです",
  alertDialog: boolean = false
) => {
  const error = Boom.badRequest();
  error.output.payload.message = message;
  error.output.payload.errorType = invalidErrorType;
  error.output.payload.alertDialog = alertDialog;
  throw error;
};
