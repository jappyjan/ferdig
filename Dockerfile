FROM node:15-alpine as build-ferdig

RUN apk update && apk add build-base git python

WORKDIR /app

# install ferdig dependencies
COPY package.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile

# build ferdig
COPY ./src ./src
COPY ./tsconfig.json .
COPY ./tsconfig.compile.json .
COPY ./.babelrc .

RUN yarn build

# remove unnecessary dependencies
RUN rm -rf node_modules
RUN yarn install --production=true --frozen-lockfile

FROM node:15-alpine as build-admin-ui

WORKDIR /app

# install admin-ui dependencies
COPY admin-ui/package.json ./
COPY admin-ui/yarn.lock ./
RUN yarn install --frozen-lockfile

# copy resources
COPY admin-ui/src ./src
COPY admin-ui/public ./public
COPY admin-ui/.browserslistrc ./.browserslistrc
COPY admin-ui/.env ./.env
COPY admin-ui/.eslintignore ./.eslintignore
COPY admin-ui/.eslintrc.js ./.eslintrc.js
COPY admin-ui/babel.config.js ./babel.config.js
COPY admin-ui/tsconfig.json ./tsconfig.json
COPY admin-ui/vue.config.js ./vue.config.js

# build admin-ui
RUN yarn build --dest dist

FROM node:15-alpine as final-image

COPY --from=build-ferdig /app/dist /ferdig/dist
COPY --from=build-ferdig /app/node_modules /ferdig/node_modules
COPY --from=build-ferdig /app/package.json /ferdig/package.json
COPY --from=build-admin-ui /app/dist /ferdig/public

WORKDIR /ferdig

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["node", "dist/index.js"]
