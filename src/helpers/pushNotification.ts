import admin, { messaging } from "firebase-admin";

export const pushNotification = async (data: messaging.Message) => {
  await admin.messaging().send(data);
};
