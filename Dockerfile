FROM ghcr.io/puppeteer/puppeteer:21.5.0

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

USER root
RUN mkdir -p /app/tokens && chmod 777 /app/tokens

CMD ["yarn", "server"]
