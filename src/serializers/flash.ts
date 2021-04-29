import { Flash } from "@prisma/client";

export type ClientFlash = Pick<Flash, "id" | "sourceType" | "source"> & {
  timeStamp: string;
};

export const serializeFlash = ({ flash }: { flash: Flash }): ClientFlash => {
  const { id, source, sourceType } = flash;
  const timeStamp = flash.createdAt.toString();

  const clientFlash: ClientFlash = {
    id,
    source,
    sourceType,
    timeStamp,
  };

  return clientFlash;
};
