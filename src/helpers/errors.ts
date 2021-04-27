import { ApiErrorType } from "~/config/apis/errors";

type CreateErrorObj =
  | {
      name: "invalidError";
      message: string;
    }
  | {
      name: "loginError";
    };

export const createErrorObj = (info: CreateErrorObj): ApiErrorType => {
  switch (info.name) {
    case "invalidError":
      return { errorType: "invalidError", message: info.message };
    case "loginError":
      return { errorType: "loginError" };
  }
};
