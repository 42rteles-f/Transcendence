#!/bin/bash

ip=$(hostname -I | awk '{print $1}')
echo "Host IP: $ip"

export HOST_IP=$ip

echo "VITE_API_URL=https://$HOST_IP:3000/" > ./frontend/.env
echo "VITE_USER_API_URL=https://$HOST_IP:3000/user/" >> ./frontend/.env
echo "VITE_GAME_API_URL=https://$HOST_IP:3000/game/" >> ./frontend/.env


echo "VITE_API_URL=https://$HOST_IP:5173/" >> ./backend/config/.backend.env
echo "VITE_USER_API_URL=https://$HOST_IP:5173/user/" >> ./backend/config/.backend.env
echo "VITE_GAME_API_URL=https://$HOST_IP:5173/game/" >> ./backend/config/.backend.env

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

# curl:
# -X METHOD - POST
# -H HEADERS - Content type
# -u HEADERS - Auth
# -d DATA/BODY