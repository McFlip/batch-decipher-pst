#!/bin/bash

# Build images using Buildah for podman deployment on RHEL instead of Docker
# Save images to archive for deployment on intranet server

pushd beeKeeper
ctr=$(buildah from node:alpine)
npm run build
buildah config --workingdir='/app' $ctr
buildah copy $ctr package.json package-lock.json /app/
buildah run $ctr npm ci
buildah copy $ctr .next /app/.next/
buildah copy $ctr public/ /app/public/
buildah copy $ctr server.js /app/
buildah copy $ctr next.config.js /app/
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
exit

pushd queenBee
ctr=$(buildah from node:alpine)
# compile using host; ts is dev dep
npx tsc
# set up mount points and permissions for non-root use
buildah run $ctr mkdir -p /app/workspace
buildah run $ctr mkdir -p /srv/public
buildah run $ctr chown node:node /app/workspace
buildah run $ctr chown node:node /srv/public
# install dep
buildah config --workingdir='/app' $ctr
buildah config --env NODE_ENV=production $ctr
buildah copy $ctr package.json package-lock.json /app/
buildah run $ctr npm ci
buildah copy $ctr dist /app/
buildah config --port 3000 $ctr
buildah config --entrypoint '"node" "index.js"' $ctr
# inside a pod inter-container networking is over 'localhost'
buildah config --env HOST_IP=localhost $ctr
buildah commit --format oci $ctr batch-decipher-pst_queenbee
popd
podman save -o images/queenbee.tar --format oci-archive batch-decipher-pst_queenbee
exit

pushd busyBee
buildah bud -t batch-decipher-pst_busybee .
popd

podman save -o images/busybee.tar --format oci-archive batch-decipher-pst_busybee 