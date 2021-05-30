import { Flash, ViewedFlash } from "@prisma/client";
import { ClientFlash } from "~/types/clientData";

export const serializeFlash = ({
  flash,
}: {
  flash: Flash & { viewed: ViewedFlash[] };
}): ClientFlash => {
  const { id, source, sourceType, viewed } = flash;
  const timestamp = new Date(flash.createdAt).toString();

  const clientFlash: ClientFlash = {
    id,
    source,
    sourceType,
    timestamp,
    viewsNumber: viewed.length,
  };

  return clientFlash;
};
