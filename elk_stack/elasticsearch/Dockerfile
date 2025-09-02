FROM docker.elastic.co/elasticsearch/elasticsearch:8.11.1

ARG ELASTIC_PASSWORD
ARG ES_JAVA_OPTS

ENV discovery.type=single-node \
	xpack.security.enabled=true \
	xpack.security.http.ssl.enabled=false \
	xpack.security.transport.ssl.enabled=false \
	ELASTIC_PASSWORD=${ELASTIC_PASSWORD} \
	ES_JAVA_OPTS=${ES_JAVA_OPTS}

EXPOSE 9200 9300