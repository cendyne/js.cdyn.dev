FROM node:19.4
COPY index.mjs package.json package-lock.json /app/
WORKDIR /app/
RUN npm i

ENTRYPOINT ["node", "/app/index.mjs"]