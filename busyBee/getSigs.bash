#!/bin/bash
# Gets certificate info from signed emails. This info is sent in the request email to RA/CA.
# Usage: getSigs.bash inputDirectory outputDirectory

inDIR=$1
outDIR=$2

# Cleanup previous runs
find "$outDIR" -type f -exec rm -f {} \;

# Extract PSTs
bash lib/xtractPSTs.bash "$inDIR" "$inDIR"

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
  keyUsage="Digital Signature, Non Repudiation"
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
pipline() {
  getSignedData "$1" | decodeSignedData | getCert | parseCert
}

# process 1 email. Use this as the mapping function and the filesystem as the reducer.
getSig() {
  cert=$(pipline "$1")
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

# Get list of emails to process
emlList=$(find "$inDIR" -name "*.eml")

# Iterate through the list using parallel processing
export -f getSig pipline parseCert getCert decodeSignedData getSignedData
export inDIR outDIR
parallel getSig {} $outDIR ::: "$emlList"

# Output all certs
find "$outDIR" -type f -name "*.cert.txt" -exec cat {} \; | tee "${2%/}/allCerts.txt"
