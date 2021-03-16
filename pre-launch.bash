#!/bin/bash
# Does host config before running docker-compose up

# mount public share - workaround for node user accessing root owned volume
sudo mount -t cifs -o username=samba_user,uid=$(id -u),gid=$(id -g) //localhost/public $(pwd)/batch-decipher-pst/public

# set permission on docker REST API Unix socket
sudo chmod 666 /var/run/docker.sock 