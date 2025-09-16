#!/bin/bash

ip=$(hostname -I | awk '{print $1}')
echo "Host IP: $ip"

sed -i 's/\r$//' .env
source .env

echo "Starting Elasticsearch..."
docker-compose up -d elasticsearch

echo "Waiting for Elasticsearch to be ready..."
until curl -s -o /dev/null -w "%{http_code}" "http://localhost:9200" | grep -q "401\|200"; do
    echo "Waiting for Elasticsearch..."
    sleep 5
done

echo "Setting kibana password..."
curl -X POST "http://localhost:9200/_security/user/kibana_system/_password" -u "elastic:$ELASTIC_PASSWORD" -H "Content-Type: application/json" -d "{\"password\":\"$ELK_PASSWORD\"}"
echo ""
echo "Creating user..."
curl -X PUT "http://localhost:9200/_security/user/$ELK_USERNAME" -u "elastic:$ELASTIC_PASSWORD" -H "Content-Type: application/json" -d '{"password":"'$ELK_PASSWORD'","roles":["superuser","kibana_system"]}'

echo "Restarting services..."

docker-compose down
docker-compose up -d

echo "Setup complete!"
x
# curl:
# -X METHOD - POST
# -H HEADERS - Content type
# -u HEADERS - Auth
# -d DATA/BODY
