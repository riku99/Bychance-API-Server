import { User } from "@prisma/client";

export type ClientUser = Omit<
  User,
  "lineId" | "createdAt" | "updatedAt" | "accessToken"
>;

export const serializeUser = ({ user }: { user: User }): ClientUser => {
  const { lineId, createdAt, updatedAt, accessToken, ...clientData } = user;

  return clientData;
};
