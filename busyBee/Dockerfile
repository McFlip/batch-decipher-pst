FROM debian
RUN mkdir -p /app/workspace/{0..15}/{getSigsPST,getSigsRFC,p7m,p12,keys,ctPST,CT,PT,exceptions,signedPST,signedRFC,unsigned}
WORKDIR /app
COPY . .
EXPOSE 3000