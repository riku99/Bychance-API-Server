import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type CreatePaylaod = {
  blockTo: string;
};
const createValidation = {
  payload: Joi.object<CreatePaylaod>({
    blockTo: Joi.string().required(),
  }),
};

export type DeleteParams = {
  userId: string;
};
const deleteValidation = {
  params: Joi.object<DeleteParams>({
    userId: Joi.string().required(),
  }),
};

export type GetGroupMembersBlockTargetUserParams = {
  userId: string;
};
const getGroupMembersBlockDataValidation = {
  params: Joi.object<GetGroupMembersBlockTargetUserParams>({
    userId: Joi.string().required(),
  }),
};

export const validaotors = {
  create: {
    validaotor: createValidation,
    failAction,
  },
  delete: {
    validaotor: deleteValidation,
    failAction,
  },
  getGroupMembersBlockData: {
    validaotor: getGroupMembersBlockDataValidation,
    failAction,
  },
};
