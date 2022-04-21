FROM debian:stable-slim
WORKDIR /app
RUN apt-get update \
&& apt-get install -y \
parallel pst-utils bbe openssl p7zip-full\
&& apt-get clean \
&& rm -rf /var/lib/apt/lists/*
COPY . .