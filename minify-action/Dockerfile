FROM node:24
COPY index.mjs package.json package-lock.json /app/
WORKDIR /app/
RUN npm i

ENTRYPOINT ["node", "/app/index.mjs"]