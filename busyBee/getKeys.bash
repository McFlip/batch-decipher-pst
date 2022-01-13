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
logPath="$outPath/log.txt"
# touch "$logPath"

# Get list of p12 files to unpack
p12List=$(find "$p12DIR" -name "*.p12")

echo "**********" >> $logPath
echo $(date) >> $logPath
echo "p12Dir: $p12DIR" >> $logPath
echo "outPath: $outPath" >> $logPath
for p in $(echo "$p12List")
do
  filename=$(basename "$p")
  echo "Processing: $filename" >> $logPath
  # Look up the password from secrets table
  # password=$(grep ^"$filename" "$secretsPath" | cut -f 2)
  # password=$(printenv 'PW_'$(basename "$filename" ".p12"))
  password=$(printenv 'PW_P12')
  keyPassword=$(printenv 'PW_KEY')
  # echo "$password" >> $logPath
  # echo "$keyPassword" >> $logPath
  # Get serial number of the embedded key - used in output filename
  serial=$(openssl pkcs12 -in "$p" -nokeys -password pass:"$password" | openssl x509 -serial -noout | cut -f 2 -d '=')
  echo "serial #: $serial" >> $logPath
  if [ -z $serial ]
  then
    echo "ERROR: can't extract cert from p12" >> $logPath
    echo "**********" >> $logPath
    exit 1
  fi
  # Extract the key
  openssl pkcs12 \
    -in "$p"\
    -nocerts\
    -passin pass:"$password"\
    -passout pass:"$keyPassword"\
    -out "$outPath/$serial.key" &>> $logPath
  if [ $? -gt 0 ]
  then
    echo "ERROR: can't extract key from p12" >> $logPath
    echo "**********" >> $logPath
    exit 1
  fi
done
echo "**********" >> $logPath
