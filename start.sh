#!/bin/bash
yarn prisma migrate dev
if [ "$NODE_ENV" = "development" ]
then
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
yarn start
fi