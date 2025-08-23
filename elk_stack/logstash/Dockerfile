FROM docker.elastic.co/logstash/logstash:8.11.1

ARG ELK_USERNAME
ARG ELK_PASSWORD
ARG LS_JAVA_OPTS

ENV ELK_USERNAME=$ELK_USERNAME \
    ELK_PASSWORD=$ELK_PASSWORD \
    LS_JAVA_OPTS=$LS_JAVA_OPTS \
    xpack.monitoring.enabled=true \
    xpack.monitoring.elasticsearch.username=$ELK_USERNAME \
    xpack.monitoring.elasticsearch.password=$ELK_PASSWORD \
    xpack.monitoring.elasticsearch.hosts=["http://elasticsearch:9200"]

COPY --chown=logstash:logstash logstash.conf /usr/share/logstash/pipeline/logstash.conf

EXPOSE 5000 5001 9600
#5044 