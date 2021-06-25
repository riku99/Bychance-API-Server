#!/bin/bash
if [ "$NODE_ENV" = "development" ]
then
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
npx prisma migrate deploy
npx prisma generate
yarn start
fi