#!/bin/bash

# Build images using Buildah for podman deployment on RHEL instead of Docker
# Save images to archive for deployment on intranet server

# update base images
podman pull debian:stable-slim && podman pull node:alpine && podman pull node:current && podman pull node:16

if [ "$1" = "beeKeeper" ] || [ "$1" = "all" ]
then
pushd beeKeeper
# update browser list & NPM packages
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npx browserslist@latest --update-db
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm update --save
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm audit
# compile
# using Node v16 because of bug in webpack bundled w/ NextJS
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:16 npm run build
# create container
ctr=$(buildah from node:alpine)
buildah config --workingdir='/app' $ctr
buildah copy $ctr package.json package-lock.json /app/
buildah run $ctr npm ci
buildah copy $ctr .next /app/.next/
buildah copy $ctr public/ /app/public/
buildah copy $ctr server.js /app/
buildah copy $ctr .env.production.local /app/
buildah config --env NODE_ENV=production $ctr
buildah config --port 8080 $ctr
buildah config --entrypoint '"npm" "start"' $ctr
buildah run $ctr addgroup -g 1001 -S nodejs
buildah run $ctr adduser -S nextjs -u 1001
buildah run $ctr chown -R nextjs:nodejs /app/.next
buildah config --user nextjs $ctr
buildah commit --format oci $ctr batch-decipher-pst_beekeeper
popd
podman save -o images/beekeeper.tar --format oci-archive batch-decipher-pst_beekeeper
fi

if [ "$1" = "queenBee" ] || [ "$1" = "all" ]
then
pushd queenBee
# updates
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm update --save
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npm audit
ctr=$(buildah from node:alpine)
# compile using temp container; ts is dev dep
podman run -it --rm --security-opt label=disable -v $(pwd):/app --workdir /app node:current npx tsc
# set up mount points and permissions for non-root use
buildah run $ctr mkdir -p /app/workspace
buildah run $ctr mkdir -p /srv/public
buildah run $ctr chown node:node /app/workspace
buildah run $ctr chown node:node /srv/public
# install dep
buildah config --workingdir='/app' $ctr
buildah config --env NODE_ENV=production $ctr
buildah copy $ctr package.json package-lock.json tsconfig.json /app/
buildah run $ctr npm ci
buildah copy $ctr dist /app/
buildah config --port 3000 $ctr
buildah config --entrypoint '"node" "-r" "tsconfig-paths/register" "index.js"' $ctr
# inside a pod inter-container networking is over 'localhost'
buildah config --env HOST_IP=localhost $ctr
buildah commit --format oci $ctr batch-decipher-pst_queenbee
popd
podman save -o images/queenbee.tar --format oci-archive batch-decipher-pst_queenbee
fi

if [ "$1" = "busyBee" ] || [ "$1" = "all" ]
then
pushd busyBee
buildah bud -t batch-decipher-pst_busybee .
popd
podman save -o images/busybee.tar --format oci-archive batch-decipher-pst_busybee 
fi