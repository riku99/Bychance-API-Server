import { Flash } from "@prisma/client";
import { ClientFlash } from "~/types/clientData";

export const serializeFlash = ({ flash }: { flash: Flash }): ClientFlash => {
  const { id, source, sourceType, thumbnail } = flash;
  const timestamp = new Date(flash.createdAt).toString();

  const clientFlash: ClientFlash = {
    id,
    source,
    sourceType,
    timestamp,
    thumbnail,
  };

  return clientFlash;
};
