#!/bin/bash
# Gets certificate info from signed emails. This info is sent in the request email to RA/CA.
# Usage: getSigs.bash inputDirectory outputDirectory custodianFile
# Custodian file is last name of each custodian in ALL CAPS; 1 per line

inDIR="$1"
outDIR="$2"
custodians="$3"

# Set up tmpfs in RAM
# Custom
# mkdir -p /tmp/PST
# chown user:group /tmp/PST
# mount -t tmpfs -o size=100M,mode=0755 tmpfs /tmp/PST
# unmount when done

# DEFAULT
# tmpfsPath="/dev/shm/PST/"
tmpfsPath="/tmp/PST/"
mkdir -p "$tmpfsPath"

# Cleanup previous runs
find "$outDIR" -type f -exec rm -f {} \;

# *** FUNCTIONS ***

# Get inner envelope of multipart/signed data
# We just want the base64 encoded block
getSignedData () {
  email="$1"
  start='Content-Type: multipart\x2Fsigned\n'
  stop="----boundary-LibPST-iamunique-"
  bbe -s --block="/$start/:/$stop/" "$email" \
  | bbe -s --block="/\n\n/:/\n\n/" \
  | sed -r '/^\s*$/d'
}

decodeSignedData () {
  base64 -d | openssl cms -cmsout
}

getCert() {
  certs="$(openssl smime -pk7out | openssl pkcs7 -print_certs -text)"
  keyUsage="Repudiation"
  beginCert="-----BEGIN CERTIFICATE-----"
  endCert="-----END CERTIFICATE-----"

  # Just 1 cert or full cert chain?
  certCnt=$(echo "$certs" | grep "BEGIN CERTIFICATE" | wc -l)
  # >&2 echo $certCnt
  if [[ $certCnt -gt 1 ]]
  then
    echo "$certs" \
    | bbe -s --block="/$keyUsage/:/$endCert/" \
    | bbe -s --block="/$beginCert/:/$endCert/"
  else
    echo "$certs" | bbe -s --block="/$beginCert/:/$endCert/"
  fi
}

parseCert() {
  openssl x509 -noout -serial -subject -dates -email -issuer -nameopt multiline
}

# compose the above functions
pipeline() {
  getSignedData "$1" | decodeSignedData | getCert | parseCert
}

# process 1 email. Use this as the mapping function and the filesystem as the reducer.
getSig() {
  cert=$(pipeline "$1")
  if [[ -z "$cert" ]]
  then
    >&2 echo -e "ERROR: Failed to get cert for:\n $1"
    outPath="${2%/}/exceptions.txt"
    echo "$1" >> "$outPath"
    exit 1
  fi
  serial=$(echo "$cert" | head -n 1 | cut -f 2 -d '=')
  outPath="${2%/}/$serial.cert.txt"
  echo "$cert" > "$outPath"
}

# *** MAIN PROCEDURE ***

# Rename PST files to Unix friendly paths
# bash lib/rename.bash "$inDIR"

# Get list of PSTs to process
pstList=$(find "$inDIR" -type f -name "*.pst")

echo "***STARTED PROCESSING    $(date)"
i=1
total=$(echo "$pstList" | wc -l)
for pst in $(echo "$pstList")
do
  echo "***Processing $i/$total    $(date)  "$pst""
  # Extract PST to RAM
  bash lib/xtractPSTs.bash "$pst" "$tmpfsPath"

  # EnCase should be able to do the filtering for us now
  # Free up space in RAM. We only need signed emails in 'Sent Items'
  # Delete everything not in 'Sent Items'
  # find "$tmpfsPath" -maxdepth 2 -mindepth 2 -type d -not -name 'Sent Items' -exec rm -rf {} \;

  # Delete emails that are not signed
  # find "$tmpfsPath" -type f -print0 | parallel --null bash lib/filterEml.bash 'Content-Type\\x3A\\x20multipart\\x2Fsigned' "{}"

  # Iterate through the dir using parallel processing
  export -f getSig pipeline parseCert getCert decodeSignedData getSignedData
  export inDIR outDIR
  find "$tmpfsPath" -type f -print0 | parallel --null --bar getSig {} $outDIR

  # Cleanup
  find "$tmpfsPath" -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} \;
  i=$((i+1))
done

# Delete false positives
bash lib/filterCert.bash "$custodians" "$outDIR"

# Output all certs
find "$outDIR" -type f -name "*.cert.txt" -exec cat {} \; | tee "${2%/}/allCerts.txt"

echo "***FINISHED PROCESSING    $(date)"
