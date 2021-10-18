import admin from "firebase-admin";

export const registerFirebaseAdmin = () => {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  // ClientConsole用プロジェクト
  admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId: process.env.CLIENT_FIREBASE_PROJECT_ID,
        clientEmail: process.env.CLIENT_FIREBASE_EMAIL,
        privateKey: process.env.CLIENT_FIREBASE_PRIVATE_KEY!.replace(
          /\\n/g,
          "\n"
        ),
      }),
    },
    "recommendationClient"
  );

  admin.initializeApp(
    {
      credential: admin.credential.cert({
        projectId: process.env.CONSOLE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.CONSOLE_FIREBASE_EMAIL,
        privateKey: process.env.CONSOLE_FIREBASE_PRIVATE_KEY!.replace(
          /\\n/g,
          "\n"
        ),
      }),
    },
    "console"
  );
};
