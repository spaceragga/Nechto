FROM node:20-alpine

WORKDIR /workspace

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/api-client/package.json ./packages/api-client/

# Skip root postinstall (build:packages) until package sources are copied.
RUN npm install -w @nechto/web -w @nechto/api-contract -w @nechto/api-client --ignore-scripts

COPY packages/api-contract ./packages/api-contract
COPY packages/api-client ./packages/api-client
RUN npm run build -w @nechto/api-contract && npm run build -w @nechto/api-client

COPY apps/web ./apps/web

WORKDIR /workspace/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]
