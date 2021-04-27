import { ApiErrorType } from "~/config/apis/errors";

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
