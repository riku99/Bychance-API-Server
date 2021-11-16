import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type CreateApplyingGroupPayload = {
  // ownerid: string;
  to: string;
};
const createApplyingGroupValidation = {
  payload: Joi.object<CreateApplyingGroupPayload>({
    // ownerid: Joi.string().required(),
    to: Joi.string().required(),
  }),
};

export type DeleteApplyingGroupParams = {
  id: string;
};
const deleteApplyingGroupValidation = {
  params: Joi.object<DeleteApplyingGroupParams>({
    id: Joi.string().required(),
  }),
};

export type GetApplyingGroupsQuery = {
  type: "applied" | undefined;
};
const getValidation = {
  query: Joi.object<GetApplyingGroupsQuery>({
    type: Joi.string().allow("applied"),
  }),
};

export const validators = {
  createApplyingGroup: {
    validator: createApplyingGroupValidation,
    failAction,
  },
  deleteApplyingGroup: {
    validator: deleteApplyingGroupValidation,
    failAction,
  },
  getApplyingGroups: {
    validator: getValidation,
    failAction,
  },
};
