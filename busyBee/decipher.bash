#!/bin/bash
# Deciphers a batch of PSTs containing encrypted mail. Outputs RFC eml files in a directory structure that mirrors the PSTs.
# Key passwords will be passed using local env vars in the form 'PW_<serial>=<password>'
# Passwords will never be stored to the FS.
# Decrypted mail will be stored unencrypted!
# Use proper security measures to safeguard the Plain Text output.
# Usage: decipher.bash inputDir outputDir keysDir exceptionsDir

inDIR="$1"
outDIR="${2%/}"
keysDIR="${3%/}"
exceptionsDIR="${4%/}"

# Set up tmpfs volume mount in RAM
# https://docs.docker.com/storage/tmpfs/

# using SAMBA share as tmp workaround for massive PST files
tmpfsPath="/$inDIR/unpack"
mkdir -p "$tmpfsPath"

# Cleanup previous runs
find "$outDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
find "$exceptionsDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;

# Extract PSTs
# Get list of PSTs to process
pstList=$(find "$inDIR" -type f -name "*.pst")

echo "***Extracting PSTs    $(date)"
i=1
total=$(echo "$pstList" | wc -l)
for pst in $(echo "$pstList")
do
  echo "***Processing $i/$total    $(date)  "$pst""
  # Extract PST
  bash lib/xtractPSTs.bash "$pst" "$tmpfsPath"

  i=$((i+1))
done

echo "***Done extracting PSTs"
# exit

# *** FUNCTIONS ***

# Check if the email is encrypted aka Cypher Text
isCT() {
  eml="$1"
  pattern='^Content-Type: application\/(x-)?pkcs7-mime'
  echo "$eml" | egrep "$pattern" > /dev/null
  if [[ $? -eq 0 ]]
  then
    printf "CT"
  else
    printf "PT"
  fi
}

# The smime.p7m attachment contains the actual CT
getP7m() {
  email="$1"
  start='Content-Type: application\x2Fpkcs7-mime\n'
  stop="----boundary-LibPST-iamunique-"
  echo "$email" | bbe -s --block="/$start/:/$stop/"
}

# Parse the key serial #s from the eml and find a matching key
getSerial() {
  p7m="$1"
  keysDIR="$2"
  # serials="$(echo "$p7m" | openssl cms -cmsout -print -noout | grep serial | cut -f 2 -d 'x')"
  serials="$(echo "$p7m" | openssl cms -cmsout -print -noout | grep serial | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//')"
  for s in $(echo "$serials")
  do
    # convert to hex
    ser=$(printf "%06X" "$s")
    # if already hex strip leading '0x'
    hex=$(echo "$s" | sed 's/^0x//')
    if [ -f "$keysDIR/$ser.key" ]
      then
        echo "$ser"
        return 0
    elif [ -f "$keysDIR/$hex.key" ]
      then
        echo "$s" | sed 's/^0x//'
        return 0
    fi
  done
  >&2 echo "No matching key for $serials"
  return 1
}

# Look up the password for a given serial #
getPW() {
  printenv PW_"$1"
}

# Decipher the email body
decipher() {
  p7m="$1"
  keyPath="$2"
  keyPW="$3"
  echo "$p7m" | openssl cms -decrypt -inkey "$keyPath" -passin pass:"$keyPW"
}

# Get the header from the original email
getHeader() {
  eml="$1"
  start="From"
  stop="MIME-Version: 1.0"
  echo "$eml" | bbe -s --block="/$start/:/$stop/"
}

# Stick the original header on top of the deciphered body
assemble() {
  eml="$1"
  body="$2"
  head=$(getHeader "$1")
  echo -e "$head\n$body"
}

# Write out to the filesystem
output() {
  # exit
  path="$1"
  data="$2"
  mkdir -p "$(dirname "$path")"
  echo "$data" > "$path"
  exit
}

# Process 1 email
pipeline() {
  filename=$(echo "$1" | sed -e "s/^\.\///")
  inDIR="$2"
  outDIR="$3"
  keysDIR="$4"
  exceptionsDIR="$5"
  fullPath="$inDIR/$filename"
  eml=$(cat "$fullPath")
  # Check if the eml is encrypted
  encryption=$(isCT "$eml")
  if [ $encryption == "PT" ]
  then
    # avoid processing email that isn't encrypted
    output "$exceptionsDIR/PT/$filename" "$eml" # comment to just drop PT
    exit 0
  fi
  # Get the smime.p7m attachment
  p7m="$(getP7m "$eml")"
  # Get the serial for the key
  serial="$(getSerial "$p7m" "$keysDIR")"
  if [[ $? -eq 1 ]]
  then
    output "$exceptionsDIR/nokeys/$filename" "$eml"
    exit 1
  fi
  # Get the password for the key
  pw="$(getPW "$serial" "$secretsPath")"
  # Decipher
  keyPath="$keysDIR/$serial.key"
  PT="$(decipher "$p7m" "$keyPath" "$pw")"
  # If successful output to PT
  if [[ $? -eq 0 ]]
  then
    output "$outDIR/$filename" "$(assemble "$eml" "$PT")"
    exit 0
  # Else output to exceptions
  else
    output "$exceptionsDIR/failed/$filename" "$eml"
    exit 1
  fi
}

# *** MAIN PROCEDURE ***

export inDIR outDIR secretsPath exceptionsDIR
export -f pipeline assemble getHeader output decipher getPW getSerial getP7m isCT

cd "$tmpfsPath"
find . -type f -name "*.eml" -print0 | parallel -0 --bar pipeline {} $tmpfsPath $outDIR $keysDIR $exceptionsDIR

# housekeeping
find "$tmpfsPath" -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} \;
