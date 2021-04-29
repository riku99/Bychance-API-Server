import { Flash } from "@prisma/client";

import { serializeFlash } from "~/serializers/flash";
import { ClientFlash } from "~/types/clientData";

const flash: Flash = {
  id: 1,
  source: "sourceURL",
  sourceType: "image",
  createdAt: new Date("2021-01-01"),
  updatedAt: new Date("2021-01-01"),
  userId: "1",
};

const clientFlash: ClientFlash = {
  id: 1,
  source: "sourceURL",
  sourceType: "image",
  timeStamp: "timeStamp",
};

describe("flash serializer", () => {
  test("clientFlashを返す", () => {
    const result = serializeFlash({ flash });
    result.timeStamp = "timeStamp";

    expect(result).toEqual(clientFlash);
  });
});
