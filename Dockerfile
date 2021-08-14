###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2021-04-14                                              ##
## version         : 1.1                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
FROM node:14-alpine

RUN apk update && apk add build-base git python

COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY ./src ./src
COPY ./tsconfig.json .
COPY ./tsconfig.compile.json .
COPY ./.babelrc .
RUN yarn build
COPY ./dist ./dist

COPY admin-ui/package.json ./admin-ui/package.json
COPY admin-ui/yarn.lock ./admin-ui/yarn.lock
RUN (cd admin-ui && yarn install)

COPY admin-ui/src ./admin-ui/src
COPY admin-ui/public ./admin-ui/public
COPY admin-ui/.browserslistrc ./admin-ui/.browserslistrc
COPY admin-ui/.env ./admin-ui/.env
COPY admin-ui/.eslintignore ./admin-ui/.eslintignore
COPY admin-ui/.eslintrc.js ./admin-ui/.eslintrc.js
COPY admin-ui/babel.config.js ./admin-ui/babel.config.js
COPY admin-ui/tsconfig.json ./admin-ui/tsconfig.json
COPY admin-ui/vue.config.js ./admin-ui/vue.config.js
RUN (cd admin-ui && yarn build)

COPY ./public ./public

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["yarn", "start:prod"]
