FROM node:14.16.0-alpine
EXPOSE 3000

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn ci

COPY . .

EXPOSE 3000

CMD [ "./scripts/start.sh" ]