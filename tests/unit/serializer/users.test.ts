import { serializeUser } from "~/serializers/user";
import { user, clientUser } from "../../data";

describe("users serializer", () => {
  test("シリアライズされてclientUserが返される", () => {
    const result = serializeUser({ user });

    expect(result).toEqual(clientUser);
  });
});
