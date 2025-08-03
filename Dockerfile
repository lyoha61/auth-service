FROM node:24.4.1-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]