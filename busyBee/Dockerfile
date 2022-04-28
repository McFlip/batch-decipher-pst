FROM debian:stable-slim
WORKDIR /app
COPY installPackages.bash .
RUN ./installPackages.bash
COPY . .