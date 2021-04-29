import { User } from "@prisma/client";
import { ClientUser } from "~/types/clientData";

export const serializeUser = ({ user }: { user: User }): ClientUser => {
  const { lineId, createdAt, updatedAt, accessToken, ...clientData } = user;

  return clientData;
};

type Keys = keyof ClientUser;

export const clientUserSelector: Record<Keys, true> = {
  id: true,
  name: true,
  avatar: true,
  introduce: true,
  statusMessage: true,
  display: true,
  lat: true,
  lng: true,
};
