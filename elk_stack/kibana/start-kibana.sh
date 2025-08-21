#!/bin/bash

chmod +x /usr/local/bin/es_check.sh
chmod +x /usr/local/bin/start-kibana.sh

echo "Starting Kibana..."
/usr/local/bin/es_check.sh
exec /usr/local/bin/kibana-docker