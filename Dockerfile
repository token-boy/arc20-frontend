FROM node:18.17.0-alpine

WORKDIR /app

ARG NPM_REGISTRY
ARG SERVICE_API
ARG MEMPOOL_URL
ENV API=$SERVICE_API
ENV NEXT_PUBLIC_API=$SERVICE_API
ENV NEXT_PUBLIC_MEMPOOL_URL=$MEMPOOL_URL

RUN npm set registry $NPM_REGISTRY
RUN npm set strict-ssl false
RUN npm install -g pnpm@8.2.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
