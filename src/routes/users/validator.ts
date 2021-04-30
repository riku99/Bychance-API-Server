import Joi from "joi";
import { User } from "@prisma/client";
import Boom from "@hapi/boom";

export type UpdateUserPayload = Pick<
  User,
  "name" | "avatar" | "introduce" | "statusMessage"
>;

const update = Joi.object<UpdateUserPayload>({
  name: Joi.string().required(),
  avatar: Joi.string().optional(),
  introduce: Joi.string().optional(),
  statusMessage: Joi.string().optional(),
});

const updateValidation = () => {
  const error = Boom.badRequest();
  error.output.payload.message = "無効なデータが含まれています";
  throw error;
};
