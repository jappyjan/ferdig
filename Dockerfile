FROM node:14-alpine as build-ferdig

RUN apk update && apk add build-base git python

# install ferdig dependencies
WORKDIR ferdig
COPY package.json .
COPY yarn.lock .
RUN yarn install

# build ferdig
COPY ./src ./src
COPY ./tsconfig.json .
COPY ./tsconfig.compile.json .
COPY ./.babelrc .

RUN yarn build

# remove unnecessary dependencies
RUN rm -rf node_modules
RUN yarn --production

FROM node:14-alpine as build-admin-ui

# install admin-ui dependencies
WORKDIR /ferdig/admin-ui
COPY admin-ui/package.json .
COPY admin-ui/yarn.lock .

RUN yarn install

# build admin-ui
COPY admin-ui/src ./src
COPY admin-ui/public ./public
COPY admin-ui/.browserslistrc ./.browserslistrc
COPY admin-ui/.env ./.env
COPY admin-ui/.eslintignore ./.eslintignore
COPY admin-ui/.eslintrc.js ./.eslintrc.js
COPY admin-ui/babel.config.js ./babel.config.js
COPY admin-ui/tsconfig.json ./tsconfig.json
COPY admin-ui/vue.config.js ./vue.config.js

RUN yarn build

FROM node:14-alpine

COPY --from=build-ferdig /ferdig/dist /ferdig/dist
COPY --from=build-ferdig /ferdig/node_modules /ferdig/node_modules
COPY --from=build-ferdig /ferdig/package.json /ferdig/package.json
COPY --from=build-admin-ui /ferdig/public /ferdig/public

WORKDIR /ferdig

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["node", "dist/index.js"]
