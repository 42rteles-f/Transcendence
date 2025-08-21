#!/bin/bash

chown logstash:logstash /usr/share/logstash/pipeline/logstash.conf
chmod +x /usr/local/bin/es_check.sh
chmod +x /usr/local/bin/start-logstash.sh

echo "Starting Logstash..."
/usr/local/bin/es_check.sh
exec /usr/local/bin/docker-entrypoint