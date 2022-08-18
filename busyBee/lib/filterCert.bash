#!/bin/bash
# Deletes cert output text file if grep fails to find given pattern
# Pattern is given as a file of custodian names - 1 per line
# Used in report phase
# Usage: filterCert.bash pathToCustodians pathToCerts

custodians="$(cat "$1")"
certs=$(find "$2" -type f -name "*.cert.txt")

# For each cert, grep for each custodian
# If we cannot find a match delete the cert
for cert in $(echo "$certs")
do
  delete=1
  for custodian in $(echo "$custodians")
  do
    grep -i -m 1 -P "$custodian" "$cert" &> /dev/null
    if [[ $? -eq 0 ]]
    then
      delete=0
      break
    fi
  done
  if [[ delete -eq 1 ]]
  then
    rm -f "$cert"
  fi
done
