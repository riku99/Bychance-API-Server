import { User } from "@prisma/client";

import { serializeUser, ClientUser } from "~/serializers/users";

const user: User = {
  id: "ididid",
  lineId: "lineline",
  name: "sutehage",
  avatar: "ava",
  introduce: "Hey!",
  statusMessage: "hello",
  display: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accessToken: "token",
  lat: "here",
  lng: "here",
};

const clientUser: ClientUser = {
  id: "ididid",
  name: "sutehage",
  avatar: "ava",
  introduce: "Hey!",
  statusMessage: "hello",
  display: true,
  lat: "here",
  lng: "here",
};

describe("users serializer", () => {
  test("シリアライズされてclientUserが返される", () => {
    const result = serializeUser({ user });

    expect(result).toEqual(clientUser);
  });
});
