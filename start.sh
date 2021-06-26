#!/bin/bash
if [ "$NODE_ENV" = "development" ]
then
yarn prisma migrate dev
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
echo ${GOOGLE_CREDENTIALS} > /google_credentials.json
npx prisma generate
yarn start
fi