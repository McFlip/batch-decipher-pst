FROM node
RUN mkdir -p /app/workspace; mkdir -p /srv/public
RUN chown node:node /app/workspace && chown node:node /srv/public
WORKDIR /app
# COPY package.json package-lock.json /app/
# RUN npm ci
EXPOSE 3000