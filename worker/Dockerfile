FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install --omit=dev && npm install --no-save typescript @types/node

COPY src ./src
RUN npx tsc

RUN useradd --create-home --shell /bin/bash worker \
  && chown -R worker:worker /app

USER worker
EXPOSE 8787

CMD ["node", "dist/index.js"]
