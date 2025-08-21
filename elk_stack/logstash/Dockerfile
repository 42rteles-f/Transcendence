FROM docker.elastic.co/logstash/logstash:8.11.1

ENV LS_JAVA_OPTS="-Xms256m -Xmx256m" \
    ELASTICSEARCH_HOST=elasticsearch \
    ELASTICSEARCH_PORT=9200

USER root
COPY logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY es_check.sh /usr/local/bin/es_check.sh
COPY start-logstash.sh /usr/local/bin/start-logstash.sh

USER logstash

ENTRYPOINT ["/usr/local/bin/start-logstash.sh"]

EXPOSE 5000 5001 9600 
#5044 