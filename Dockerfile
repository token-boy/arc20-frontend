FROM node:18.17.0-alpine

WORKDIR /app

ARG NPM_REGISTRY
ARG SERVICE_API
ENV API=$SERVICE_API

RUN npm set registry $NPM_REGISTRY
RUN npm set strict-ssl false
RUN npm install -g pnpm@8.2.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
