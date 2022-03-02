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
reportPath="$exceptionsDIR/report_$(date '+%Y-%m-%d_%H%M').txt"

# Set up tmpfs volume mount in RAM
# https://docs.docker.com/storage/tmpfs/

# using SAMBA share as tmp workaround for massive PST files
# tmpfsPath="/$inDIR/unpack"
tmpfsPath="/tmp/PST/"
mkdir -p "$tmpfsPath"

# Cleanup previous runs
# find "$outDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
# find "$exceptionsDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;



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
  pattern='^Content-Type: application\/(x-)?pkcs7-mime'
  cryptoCount=$(echo "$email" | egrep -c "$pattern")
  if [[ $cryptoCount -gt 1 ]]
  then
  	# more than 1 encrypted email - not supported yet
    return 1
  fi
  boundary=$(echo "$email" | grep -m 1 'boundary=' | awk -F'["]' '{print $2}')
  p7mBoundary=$(echo "$email" | egrep -B1 "$pattern" | head -n 1)
  if [[ "--${boundary}" != "$p7mBoundary" ]]
  then
    # encrypted email is a child of PT email
    return 1
  fi
  echo "$email" | bbe -s --block="/$start/:/$stop/"
  return 0
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

# Decipher the email body
decipher() {
  p7m="$1"
  keyPath="$2"
  # keyPW="$3"
  echo "$p7m" | openssl cms -decrypt -inkey "$keyPath" -passin env:PW_KEY
}

# Get the header from the original email
getHeader() {
  eml="$1"
  # start="From"
  stop="MIME-Version: 1.0"
  # echo "$eml" | bbe -s --block="/$start/:/$stop/"
  echo "$eml" | awk "NR==1,/$stop/"
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
  # check if path already exists before writing out
  if [ ! -f "$path" ]
  then
    echo "$data" > "$path"
  else
    # rename file to avoid overwrite
    i=0
    while [ -f "$(dirname "$path")/$i.eml" ]
    do
      i=$((i+1))
    done
    echo "$data" > "$(dirname "$path")/$i.eml"
  fi
  exit
}

# Log Exceptions
except() {
  EML_PATH="$1"
  REASON="$2"
  header="$3"

  FROM=$(echo "$header" | bbe -s --block='/\nFrom:/:/:/' | egrep '^From:|\s' | sed 's/.*: //' | tr '\n\t' ' ')
  TO=$(echo "$header" | bbe -s --block='/\nTo:/:/:/' | egrep '^To:|\s' | sed 's/.*: //' | tr '\n\t' ' ')
  CC=$(echo "$header" | bbe -s --block='/\nCC:/:/:/' | egrep '^CC:|\s' | sed 's/.*: //' | tr '\n\t' ' ')
  BCC=$(echo "$header" | bbe -s --block='/\nBCC:/:/:/' | egrep '^BCC:|\s' | sed 's/.*: //' | tr '\n\t' ' ')
  SUBJECT=$(echo "$header" | grep '^Subject:' | sed 's/.*: //')
  THREAD_TOPIC=$(echo "$header" | grep '^Thread-Topic:' | sed 's/.*: //')
  THREAD_INDEX=$(echo "$header" | sed -e '/^$/q;/^Thread-Index:/!d;n;:c;/^\s/!d;n;bc' | tr -d '\n' | sed 's/.*: //')
  DATE=$(echo "$header" | grep '^Date:' | sed 's/.*: //')
  DATE_FMT=$(date --utc --date="$(echo $DATE)" +'%D %T')
  MESSAGE_ID=$(echo "$header" | grep -A1 '^Message-ID:' | awk -F'[<,>]' '{print $2}' | tr -d '\n')
  ATTACHMENTS=$(grep 'filename=\".*\"' "$EML_PATH" | grep -v 'smime.p7m' | grep -v 'rtf-body.rtf' | sed 's/^.*=//' | tr '\n' ';' | sed 's/;$//')
  echo -e "$EML_PATH\t$FROM\t$TO\t$CC\t$BCC\t$SUBJECT\t$THREAD_TOPIC\t$THREAD_INDEX\t$DATE_FMT\t$MESSAGE_ID\t$ATTACHMENTS\t$REASON" >> "$reportPath"
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
    # output "$exceptionsDIR/PT/$filename" "$eml" # comment to just drop PT
    exit 0
  fi
  # Get the smime.p7m attachment
  p7m="$(getP7m "$eml")"
  if [[ $? -eq 1 ]]
  then
    # edge case detected
    except "$filename" "Manual Review" "$(getHeader "$eml")"
    output "$exceptionsDIR/manual/$filename" "$eml"
    exit 1
  fi
  # Get the serial for the key
  serial="$(getSerial "$p7m" "$keysDIR")"
  if [[ $? -eq 1 ]]
  then
    except "$filename" "Missing Key" "$(getHeader "$eml")"
    output "$exceptionsDIR/nokeys/$filename" "$eml"
    exit 1
  fi
  # Get the password for the key
  # pw="$(printenv PW_KEY)"
  # >&2 echo pw is "$pw"
  # Decipher
  keyPath="$keysDIR/$serial.key"
  # >&2 echo keyPath is "$keyPath"
  PT="$(decipher "$p7m" "$keyPath")"
  # If successful output to PT
  if [[ $? -eq 0 ]]
  then
    output "$outDIR/$filename" "$(assemble "$eml" "$PT")"
    exit 0
  # Else output to exceptions
  else
    except "$filename" "Failed to Decrypt" "$(getHeader "$eml")"
    # output "$exceptionsDIR/failed/$filename" "$eml"
    exit 1
  fi
}

# *** MAIN PROCEDURE ***

export inDIR outDIR exceptionsDIR reportPath
export -f pipeline assemble getHeader output decipher getSerial getP7m isCT except

echo -e "Path\tFrom\tTo\tCC\tBCC\tSubject\tThread-Topic\tThread-Index\tDate(UTC)\tMessage-ID\tAttachments\tReason" > "$reportPath"

# Extract PSTs
# Get list of PSTs to process
pstList=$(find "$inDIR" -type f -name "*.pst")

i=1
total=$(echo "$pstList" | wc -l)
for pst in $(echo "$pstList")
do
  echo "***Processing $i/$total    $(date)  "$pst""
  # Extract PST
  bash lib/xtractPSTs.bash "$pst" "$tmpfsPath"

	# iterate through unpacked PST
  cd "$tmpfsPath"
  find . -type f -name "*.eml" -print0 | parallel -0 --bar pipeline {} $tmpfsPath $outDIR $keysDIR $exceptionsDIR

  # housekeeping
  find "$tmpfsPath" -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} \;
  cd /app
  i=$((i+1))
done
echo "*** Done    $(date)"
