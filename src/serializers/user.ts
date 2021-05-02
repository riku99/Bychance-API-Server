import { User } from "@prisma/client";
import { ClientUser } from "~/types/clientData";

export const serializeUser = ({ user }: { user: User }): ClientUser => {
  const { lineId, createdAt, updatedAt, accessToken, ...clientData } = user;

  return clientData;
};
