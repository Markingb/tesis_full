FROM node:14
WORKDIR /

COPY package*,json ./

RUN npm install
COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]
#npm install

# docker pull mongo:4.4.18-rc0-focal
# docker run --name mongo -d -p  27017:27017 mongo:4.4.18-rc0-focal


# node server.js