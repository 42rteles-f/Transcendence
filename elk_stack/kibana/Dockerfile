FROM docker.elastic.co/kibana/kibana:8.11.1

ARG ELK_USERNAME
ARG ELK_PASSWORD

ENV ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
    ELASTICSEARCH_USERNAME=kibana_system \
    ELASTICSEARCH_PASSWORD=${ELK_PASSWORD} \
    xpack.security.enabled=true \
    xpack.ml.enabled=false \
    NODE_OPTIONS="--max-old-space-size=512"

EXPOSE 5601