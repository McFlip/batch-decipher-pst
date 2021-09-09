#!/bin/bash

# Build images using Buildah for podman dev environment

pushd busyBee
buildah bud -t batch-decipher-pst_busybee .
popd
