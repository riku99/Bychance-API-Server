import { FlashStamp } from "@prisma/client";
import { ClientFlash, FlashStampData } from "~/types/clientData";
import { CreateClientDataArg } from "~/helpers/clientData";

export const serializeFlash = ({
  flash,
}: {
  flash: CreateClientDataArg["flashes"][number];
}): ClientFlash => {
  const { id, source, sourceType, viewed, stamps } = flash;
  const timestamp = new Date(flash.createdAt).toString();
  let clientStampData: FlashStampData = {
    thumbsUp: {
      number: 0,
      userIds: [],
    },
    yusyo: {
      number: 0,
      userIds: [],
    },
    yoi: {
      number: 0,
      userIds: [],
    },
    itibann: {
      number: 0,
      userIds: [],
    },
    seikai: {
      number: 0,
      userIds: [],
    },
  };

  stamps.forEach((stamp) => {
    clientStampData[stamp.value].number += 1;
    clientStampData[stamp.value].userIds.push(stamp.userId);
  });

  const clientFlash: ClientFlash = {
    id,
    source,
    sourceType,
    timestamp,
    stamps: clientStampData,
    viewsNumber: viewed.length,
  };

  return clientFlash;
};
