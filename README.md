# foodApp

Client side : npm start @ client/
server side: docker-compose up @ root

after starting hit localhost:8080/dev/initdb and initkey once
then in terminal in client @ server: curl -X GET http://localhost:8080/dev/initdbing

to reset db:
docker-compose down --volumes --remove-orphans
docker-compose build --no-cache
docker-compose up
