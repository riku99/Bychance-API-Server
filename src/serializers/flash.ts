import { ClientFlash } from "~/types/clientData";
import { CreateClientDataArg } from "~/helpers/clientData";

export const serializeFlash = ({
  flash,
}: {
  flash: CreateClientDataArg["flashes"][number];
}): ClientFlash => {
  const { id, source, sourceType, viewed, stamps } = flash;
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
