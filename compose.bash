#!/bin/bash
# Workaround for podman-compose - will bring up the project pod and containers
# Use build script to build with buildah
# Create share '/srv/public' ahead of time and configure access
# Meant to be run rootless
# Bring down project with pod stop; pod rm; rm podman/podman.sock

PROJ=batch-decipher-pst

# create the unix socket
if [ ! -d podman ]
then
    mkdir podman
fi
if [ -S podman/podman.sock ]
then
    # sometimes there are permission errors if re-using old socket so always start fresh
    rm -f podman/podman.sock
fi
podman system service -t 0 unix:$(pwd)/podman/podman.sock &

# check for pod; if it doesn't exist then exit code == 1
podman pod exists $PROJ
if [ $? -eq 1 ]
then
    # create pod and publish web server and API
    podman pod create --name $PROJ -p 8080:8080 -p 3000:3000
else
    # recycle
    podman pod stop $PROJ
    podman pod rm $PROJ
    podman pod create --name $PROJ -p 8080:8080 -p 3000:3000
fi

# front end
podman run -dt --pod $PROJ --name "$PROJ"_beekeeper \
    --env NODE_ENV=production \
    --env NODE_TLS_REJECT_UNAUTHORIZED=1 \
		--env NODE_EXTRA_CA_CERTS=/app/tlscert/ca.crt \
    --env apiInternal=localhost \
    -v $(pwd)/tlscert:/app/tlscert:z,U \
    "$PROJ"_beekeeper

# back end
podman run -dt --pod $PROJ --name "$PROJ"_queenbee \
    --env NODE_ENV=production \
    -v /srv/public:/srv/public:z,U \
    -v "$PROJ"_hive:/app/workspace:z,U \
    -v $(pwd)/podman/podman.sock:/var/run/docker.sock:Z \
    -v $(pwd)/tlscert:/app/tlscert:z \
    "$PROJ"_queenbee
