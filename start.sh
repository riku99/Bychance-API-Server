#!/bin/bash
if [ "$NODE_ENV" = "development" ]
then
yarn prisma migrate dev
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
echo ${GOOGLE_CREDENTIALS} > /google_credentials.json
npx prisma migrate deploy
npx prisma generate
yarn build
yarn start
fi