import { serializeFlash } from "~/serializers/flash";
import { flash, clientFlash } from "../../data";

describe("flash serializer", () => {
  test("clientFlashを返す", () => {
    const result = serializeFlash({ flash });
    result.timestamp = "timestamp";

    expect(result).toEqual(clientFlash);
  });
});
