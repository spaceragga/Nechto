FROM node:22-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/api-client/package.json ./packages/api-client/
COPY apps/api/prisma ./apps/api/prisma

# Skip root postinstall (build:packages) until package sources are copied.
RUN npm ci --ignore-scripts

COPY packages/api-contract ./packages/api-contract
RUN npm run build -w @nechto/api-contract

COPY apps/api ./apps/api

WORKDIR /workspace/apps/api

RUN npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
