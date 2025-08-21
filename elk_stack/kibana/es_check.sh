#!/bin/bash

if ! command -v curl &> /dev/null; then
    apt-get update && apt-get install -y curl
fi

echo "Waiting for Elasticsearch..."
until curl -s http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    echo "Elasticsearch is not ready yet. Waiting..."
    sleep 5
done
echo "Elasticsearch is ready!"