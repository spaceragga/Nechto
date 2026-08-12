FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

RUN npm install -w @nechto/web

COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]
