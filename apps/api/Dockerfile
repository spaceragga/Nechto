FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm install -w @nechto/api

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api

EXPOSE 3001

CMD ["npm", "run", "dev"]
