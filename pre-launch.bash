#!/bin/bash
# Does host config before running docker-compose up

# mount public share - workaround for node user accessing root owned volume
sudo mount -t cifs -o username=samba_user,uid=$(id -u),gid=$(id -g) //localhost/public $(pwd)/public

# start the docker service
sudo systemctl start docker

# set permission on docker REST API Unix socket
sudo chmod 666 /var/run/docker.sock 