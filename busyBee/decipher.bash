#!/bin/bash
# Deciphers a batch of PSTs containing encrypted mail. Outputs RFC eml files in a directory structure that mirrors the PSTs.
# Key passwords will be passed using Docker Secrets.
# In production set secretsPath to "/run/secrets/<caseName>_keyPWs"
# The input secret is a tsv file in the form "keySerial#    keyPassword"
# Passwords will never be stored to the FS.
# Decrypted mail will be stored unencrypted!
# Use proper security measures to safeguard the Plain Text output.
# Usage: decipher.bash inputDir outputDir secretsPath keysDir exceptionsDir

inDIR="$1"
outDIR="${2%/}"
secretsPath="$3"
keysDIR="${4%/}"
exceptionsDIR="${5%/}"
emailList="${1%/}/emailList"

# Cleanup previous runs
# find "$outDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;

# Extract PSTs
bash lib/xtractPSTs.bash "$inDIR" "$inDIR"

# Get list of emails with relative paths
pushd "$inDIR"
# find . -type f -name "*.eml" -print0 > "$emailList"
find . -type f -name "*.eml" -print0 > emailList
popd

# *** FUNCTIONS ***

# Check if the email is encrypted aka Cypher Text
isCT() {
  eml="$1"
  # pattern='_-_-
# Content-Type: application/pkcs7-mime'
  pattern='Content-Type: application/pkcs7-mime'
  # pattern='Content-Type'
  echo "$eml" | grep "$pattern" > /dev/null
  if [[ $? -eq 0 ]]
  then
    printf "CT"
  else
    printf "PT"
  fi
}

# The smime.p7m attachment contains the actual CT
getP7m() {
  eml="$1"
}

# Parse the key serial #s from the eml and find a matching key
getSerial() {
  eml="$1"
  keyList="$2"
}

getPW() {
  serial=$1
  cat "$secretsPath" | grep ^$1 | cut -f 2
}

decipher() {
  p7m="$1"
  keyPath="$2"
  keyPW="$3"
  echo "$p7m" | openssl cms -decrypt -inkey "$keyPath" -passin pass:"$keyPW"
}

getHeader() {
  eml="$1"
}

assemble() {
  eml="$1"
  body="$2"
  head=$(getHeader "$1")
  echo "$head$body"
}

joinPath() {
  rootPath="$1"
  filename=$(echo "$2" | sed "s/ /_/g")
  echo "$rootPath/$filename"
}

output() {
  path="$1"
  data="$2"
  mkdir -p $(dirname "$path")
  echo "$data" > "$path"
  exit
}

pipline() {
  filename=$(echo "$1" | sed -e "s/^\.\///")
  inDIR="$2"
  outDIR="$3"
  secretsPath="$4"
  keysDIR="$5"
  exceptionsDIR="$6"
  fullPath="$inDIR/$filename"
  eml=$(cat "$fullPath")
  # Check if the eml is encrypted
  encryption=$(isCT "$eml")
  # If PT then output to PT
  if [ $encryption == "PT" ]
  then
    # echo "$filename NOT encrypted"
    output $(joinPath "$outDIR" "$filename") "$eml"
  else
    echo "$filename is encrypted"
  fi
  # Get the smime.p7m attachment
  # Get the serial for the key
  # Get the password for the key
  # Decipher
  # keypath="$keysDIR/$serial"
  # If successful output to PT
  # Else output to exceptions
}

# *** MAIN PROCEDURE ***

export inDIR outDIR secretsPath exceptionsDIR
export -f pipline assemble getHeader output decipher getPW getSerial getP7m isCT joinPath
# parallel -0 --bar pipline {} $inDIR $outDIR $secretsPath $keysDIR $exceptionsDIR :::: "$emailList"
parallel -0 pipline {} $inDIR $outDIR $secretsPath $keysDIR $exceptionsDIR :::: "$emailList"

# housekeeping
rm "$emailList"