#!/bin/bash
# Deciphers a batch of PSTs containing encrypted mail. Outputs RFC eml files in a directory structure that mirrors the PSTs.
# Key passwords will be passed using local env vars in the form 'PW_<serial>=<password>'
# Passwords will never be stored to the FS.
# Decrypted mail will be stored unencrypted!
# Use proper security measures to safeguard the Plain Text output.
# Usage: decipher.bash inputDir outputDir keysDir exceptionsDir

# TODO: extract PSTs to tmpfs in RAM instead of inDIR

inDIR="$1"
outDIR="${2%/}"
# secretsPath="$3"
keysDIR="${3%/}"
exceptionsDIR="${4%/}"
emailList="${1%/}/emailList"

# Set up tmpfs in RAM
# Custom
# mkdir -p /tmp/PST
# chown user:group /tmp/PST
# mount -t tmpfs -o size=100M,mode=0755 tmpfs /tmp/PST
# unmount when done

# DEFAULT
tmpfsPath="/dev/shm/PST/"
mkdir -p "$tmpfsPath"

# Cleanup previous runs
find "$outDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;

# Extract PSTs
# Get list of PSTs to process
pstList=$(find "$inDIR" -type f -name "*.pst")

echo "***Extracting PSTs    $(date)"
i=1
total=$(echo "$pstList" | wc -l)
for pst in $(echo "$pstList")
do
  echo "***Processing $i/$total    $(date)  "$pst""
  # Extract PST to RAM
  # bash lib/xtractPSTs.bash "$pst" "$tmpfsPath"
  bash lib/xtractPSTs.bash "$pst" "$inDIR"

  i=$((i+1))
done

# Get list of emails with relative paths
pushd "$inDIR"
# pushd "$tmpfsPath"
find . -type f -name "*.eml" -print0 > emailList
popd

# *** FUNCTIONS ***

# Check if the email is encrypted aka Cypher Text
isCT() {
  eml="$1"
  pattern='^Content-Type: application/pkcs7-mime'
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
  email="$1"
  start='Content-Type: application\x2Fpkcs7-mime\n'
  stop="----boundary-LibPST-iamunique-"
  echo "$email" | bbe -s --block="/$start/:/$stop/"
}

# Parse the key serial #s from the eml and find a matching key
getSerial() {
  p7m="$1"
  keysDIR="$2"
  serials="$(echo "$p7m" | openssl cms -cmsout -print -noout | grep serial | cut -f 2 -d 'x')"
  for s in "$serials"
  do
    if [ -f "$keysDIR/$s.key" ]
      then
        echo "$s"
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
  stop="Content-Disposition"
  echo "$eml" | bbe -s --block="/$start/:/$stop/" | head -n -1
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
  # secretsPath="$4"
  keysDIR="$4"
  exceptionsDIR="$5"
  fullPath="$inDIR/$filename"
  eml=$(cat "$fullPath")
  # Check if the eml is encrypted
  encryption=$(isCT "$eml")
  # If PT then output to PT
  if [ $encryption == "PT" ]
  then
    output "$outDIR/$filename" "$eml"
  fi
  # Get the smime.p7m attachment
  p7m="$(getP7m "$eml")"
  # Get the serial for the key
  serial="$(getSerial "$p7m" "$keysDIR")"
  if [[ $? -eq 1 ]]
  then
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
    output "$exceptionsDIR/$filename" "$eml"
    exit 1
  fi
}

# *** MAIN PROCEDURE ***

export inDIR outDIR secretsPath exceptionsDIR
export -f pipeline assemble getHeader output decipher getPW getSerial getP7m isCT
# parallel -0 --bar pipeline {} $inDIR $outDIR $secretsPath $keysDIR $exceptionsDIR :::: "$emailList"
parallel -0 pipeline {} $inDIR $outDIR $keysDIR $exceptionsDIR :::: "$emailList"

# housekeeping
rm "$emailList"
find "$tmpfsPath" -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} \;
