#!/bin/bash
yarn prisma migrate dev
if [ "$NODE_ENV" = "development" ]
then
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
npx prisma generate
yarn start
fi