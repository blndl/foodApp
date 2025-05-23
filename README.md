# foodApp

Client side : npm start @ client/
server side: docker-compose up @ root

after starting hit localhost:8080/initdb and initkey once

to reset db:
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up
