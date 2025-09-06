FROM nginx:alpine

WORKDIR /etc/nginx/certs

RUN apk update && apk upgrade && apk add --no-cache openssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx.key -out nginx.crt \
    -subj "/C=PT/ST=Lisbon/L=Lisbon/O=Transcendence/CN=transcendence.com"

RUN pwd

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
