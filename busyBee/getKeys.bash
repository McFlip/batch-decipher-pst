#!/bin/bash
# Gets key files from p12 containers. You get the p12 files back from the RA after submitting request.
# Keys will be stored encrypted in the output Dir, using the same password that was used for the p12 export.
# Keys will be named according to their serial #.
# A tsv file mapping serial #s to the original p12 filename will be exported as well.
# Export passwords will be passed using Docker Secrets.
# In production set secretsPath to "/run/secrets/<caseName>_exportPWs"
# The input secret is a tsv file in the form "p12filename    exportPassword"
# Passwords will never be stored to the FS. Keys will be stored encrypted.
# Usage: getSigs.bash inputDirectory outputDirectory secretsPath

p12DIR=$1
outPath="${2%/}"
secretsPath=$3

# Clean up previous runs
find "$2" -type f -exec rm -f {} \;

# Get list of p12 files to unpack
p12List=$(find "$p12DIR" -name "*.p12")

for p in $(echo "$p12List")
do
  filename=$(basename "$p")
  # Look up the password from secrets table
  # password=$(grep ^"$filename" "$secretsPath" | cut -f 2)
  password=$(printenv 'PW_'$(basename "$filename" ".p12"))
  # echo "$password"
  # Get serial number of the embedded key - used in output filename
  serial=$(openssl pkcs12 -in "$p" -nokeys -password pass:"$password" | openssl x509 -serial -noout | cut -f 2 -d '=')
  # Extract the key
  openssl pkcs12 \
    -in "$p"\
    -nocerts\
    -passin pass:"$password"\
    -passout pass:"$password"\
    -out "$outPath/$serial.key"
  # append serial number to output table
  # this table will be used by the API later to pass in the correct password for each key
  echo -e "$filename\t$serial" | tee -a "$outPath/serials.tsv"
done