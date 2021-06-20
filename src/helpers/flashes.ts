import { FlashStamp } from "@prisma/client";

import { filterByDayDiff } from "~/utils";
import { serializeFlash } from "~/serializers/flash";
import { FlashWithIncludesItem } from "~/helpers/clientData";
import { FlashStampValuesData } from "~/types/clientData";

export const filterExpiredFlash = (d: Date) => filterByDayDiff(d, 20);

export const createClientFlashes = (flashes: FlashWithIncludesItem) => {
  const notExpiredFlashes = flashes.filter((flash) =>
    filterExpiredFlash(flash.createdAt)
  );
  return notExpiredFlashes.map((flash) => serializeFlash({ flash }));
};

export const createClientFlashStampValuesData = (
  stamps: FlashStamp[],
  flashId: number
) => {
  let clientStampData: FlashStampValuesData = {
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

  return {
    flashId,
    data: clientStampData,
  };
};

export const createClientFlashStamps = (flashes: FlashWithIncludesItem) => {
  const result = flashes
    .map((f) => {
      if (filterExpiredFlash(f.createdAt)) {
        return createClientFlashStampValuesData(f.stamps, f.id);
      }
    })
    .filter((f): f is Exclude<typeof f, undefined> => f !== undefined);

  return result;
};
