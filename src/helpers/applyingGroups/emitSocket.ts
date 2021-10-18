import { applyingGroupNameSpace } from "~/server";

export const emitApplyGroup = ({ to, data }: { to: string; data: any }) => {
  applyingGroupNameSpace.to(to).emit("applyGroup", data);
};
