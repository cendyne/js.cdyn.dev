FROM node:19.4
COPY index.js package.json package-lock.json /app/
WORKDIR /app/
RUN npm i

ENTRYPOINT ["node", "index.mjs"]