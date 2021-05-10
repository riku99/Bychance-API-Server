import admin, { messaging } from "firebase-admin";

export const pushNotificationToOne = async (data: messaging.Message) => {
  await admin.messaging().send(data);
};

export const pushNotificationToMany = async (
  data: messaging.MulticastMessage
) => {
  await admin.messaging().sendMulticast(data);
};
