import Boom from "@hapi/boom";

import { loginErrorType } from "~/config/apis/errors";

export const throwLoginError = () => {
  const error = Boom.unauthorized();
  error.output.payload.errorType = loginErrorType;
  throw error;
};
