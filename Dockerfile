FROM node:14-alpine as build

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
RUN rm -rf node_modules
RUN yarn --production

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

WORKDIR /ferdig/admin-ui
RUN yarn build

FROM gcr.io/distroless/nodejs:10

COPY --from=build /ferdig/dist /ferdig/dist
COPY --from=build /ferdig/node_modules /ferdig/node_modules
COPY --from=build /ferdig/package.json /ferdig/package.json
COPY --from=build /ferdig/public /ferdig/public

WORKDIR /ferdig

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["dist/index.js"]
