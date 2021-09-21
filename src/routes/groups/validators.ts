import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type CreateGroupsPayload = {
  ownerId: string;
};
const createGroupsValidation = {
  payload: Joi.object<CreateGroupsPayload>({
    ownerId: Joi.string().required(),
  }),
};

export const validators = {
  create: {
    validator: createGroupsValidation,
    failAction,
  },
};
