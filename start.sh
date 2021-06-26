#!/bin/bash
if [ "$NODE_ENV" = "development" ]
then
yarn prisma migrate dev
yarn dev
elif [ "$NODE_ENV" = "production" ]
then
yarn start
fi