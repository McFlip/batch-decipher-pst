#!/bin/bash
# Workaround for podman-compose - will bring up the project pod and containers
# Use build script to build with buildah
# Create share volume ahead of time
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
    podman pod create --name $PROJ -p 8080:8080 -p 3000:3000 -p 3001:3001
else
    # recycle
    podman pod stop $PROJ
    podman pod rm $PROJ
    podman pod create --name $PROJ -p 8080:8080 -p 3000:3000 -p 3001:3001
fi

# front end
podman run -dt --name "$PROJ"_beekeeper \
    --env NODE_ENV=development \
    --env NEXTAUTH_URL=http://localhost:3001 \
    --env NEXTAUTH_SECRET=secretSquirrel \
    -v $(pwd)/beeKeeper:/app:Z \
    -w /app \
     --pod $PROJ \
    node:16 \
    npm run dev

# back end
podman run -dt --name "$PROJ"_queenbee \
    --privileged \
    --env DEBUG=* \
    --env NODE_ENV=development \
    --env NEXTAUTH_SECRET=secretSquirrel \
    -v $(pwd)/queenBee:/app:Z \
    -w /app \
    -v /srv/public:/srv/public:z,U \
    -v "$PROJ"_hive:/app/workspace:z,U \
    -v $(pwd)/podman/podman.sock:/var/run/docker.sock:Z \
    --pod $PROJ \
    node:current \
    npm start

# SAML ID provider
podman run -dt --name "$PROJ"_saml \
    --env SIMPLESAMLPHP_SP_ENTITY_ID=saml-poc \
    --env SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:3001/api/auth/login/response \
    --pod $PROJ \
    test-saml-idp