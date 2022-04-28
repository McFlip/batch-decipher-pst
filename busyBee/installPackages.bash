#!/bin/bash
# Install debian packages for Busy Bee as part of build

# non-interactive script
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

# Debian install
apt-get update
apt-get -y upgrade
apt-get -y install --no-install-recommends parallel pst-utils bbe openssl p7zip-full
apt-get clean

# Delete index files we don't need anymore:
rm -rf /var/lib/apt/lists/*