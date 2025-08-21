FROM docker.elastic.co/elasticsearch/elasticsearch:8.11.1

ENV discovery.type=single-node \
	xpack.security.enabled=false \
	xpack.security.enrollment.enabled=false \
	xpack.ml.enabled=false \
	ES_JAVA_OPTS="-Xms512m -Xmx512m" \
	cluster.name=transcendence-cluster \
	node.name=transcendence-node

RUN echo "Starting Elasticsearch..."

EXPOSE 9200 9300