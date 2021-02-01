FROM debian
RUN mkdir -p /app/workspace/{0..15}/{getSigsPST,getSigsRFC,p7m,p12,keys,ctPST,CT,PT,exceptions,signedPST,signedRFC,unsigned}
WORKDIR /app
RUN apt-get update && apt-get install -y parallel pst-utils && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY . .
# EXPOSE 3000