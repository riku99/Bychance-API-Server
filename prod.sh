#!/bin/bash
if [ "$NODE_ENV" = "production" ]
then
npx prisma migrate deploy && npx prisma generate
fi