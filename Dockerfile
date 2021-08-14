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

WORKDIR /ferdig
COPY package.json /ferdig
COPY yarn.lock /ferdig
RUN yarn install
COPY ./src /ferdig/src
COPY ./tsconfig.json /ferdig
COPY ./tsconfig.compile.json /ferdig
COPY ./.babelrc /ferdig
RUN yarn build
COPY ./dist /ferdig/dist

COPY admin-ui/package.json /ferdig/admin-ui/package.json
COPY admin-ui/yarn.lock /ferdig/admin-ui/yarn.lock

WORKDIR admin-ui
RUN yarn install

WORKDIR /ferdig
COPY admin-ui/src /ferdig/admin-ui/src
COPY admin-ui/public /ferdig/admin-ui/public
COPY admin-ui/.browserslistrc /ferdig/admin-ui/.browserslistrc
COPY admin-ui/.env /ferdig/admin-ui/.env
COPY admin-ui/.eslintignore /ferdig/admin-ui/.eslintignore
COPY admin-ui/.eslintrc.js /ferdig/admin-ui/.eslintrc.js
COPY admin-ui/babel.config.js /ferdig/admin-ui/babel.config.js
COPY admin-ui/tsconfig.json /ferdig/admin-ui/tsconfig.json
COPY admin-ui/vue.config.js /ferdig/admin-ui/vue.config.js

RUN yarn build

COPY ./public ./public

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["yarn", "start:prod"]
