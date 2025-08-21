FROM docker.elastic.co/kibana/kibana:8.11.1

ENV ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
	xpack.security.enabled=false \
	xpack.ml.enabled=false \
	NODE_OPTIONS="--max-old-space-size=512"

USER root
COPY es_check.sh /usr/local/bin/es_check.sh
COPY start-kibana.sh /usr/local/bin/start-kibana.sh

USER kibana

ENTRYPOINT ["/usr/local/bin/start-kibana.sh"]

EXPOSE 5601