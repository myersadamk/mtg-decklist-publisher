# Magci: The Gathering Decklist Publisher
WIP: The intention of this application is to retrieve decklists from popular MTG sites on a scheduled-task basis. 
It utilizes Redis to persist data between executions, and prioritizes updates based on dates. Perhaps it will
wind up dropping new decks onto a Kafka topic or something of the sort?

# Troubleshooting
If you see "Service 'redis' is using volume '/data' from a previous container...", execute the following command:

`docker-compose rm redis`
