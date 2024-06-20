FROM node:10

RUN mkdir -p /usr/src/puckiq-web
WORKDIR /usr/src/puckiq-web

COPY package.json /usr/src/puckiq-web
RUN npm install

COPY . /usr/src/puckiq-web

EXPOSE 5000

CMD [ "npm", "start" ]
