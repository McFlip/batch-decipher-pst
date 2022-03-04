#!/bin/bash

# *** This is a temp hack to reprocess opaque-signed emails from previous jobs
# *** Changes already incorporated into decipher.bash - don't use this for future jobs

# Deciphers a batch of PSTs containing encrypted mail. Outputs RFC eml files in a directory structure that mirrors the PSTs.
# Key password will be passed using container env var 'PW_KEY' - 1 case pw for all keys
# Passwords will never be stored to the FS.
# Decrypted mail will be stored unencrypted!
# Use proper security measures to safeguard the Plain Text output.
# Use absolute paths
# Usage: decipher.bash inputDir outputDir keysDir exceptionsDir

inDIR="${1%/}"
outDIR="${2%/}"
keysDIR="${3%/}"
exceptionsDIR="${4%/}"
reportPath="$exceptionsDIR/report_$(date '+%Y-%m-%d_%H%M').txt"

# using disk as tmp workaround for massive PST files
# tmpfsPath="/$inDIR/unpack"

# mount RAM temp fs into container
# this will be our buffer for unpacking PSTs
# tmpfsPath="/tmp/PST/"
# mkdir -p "$tmpfsPath"
tmpfsPath="$(echo $inDIR)"

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
  start='Content-Type: application\/pkcs7-mime'
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
    # encrypted email is a child of PT email - not supported yet
    return 1
  fi
  echo "$email" | awk "/$start/,/$stop/"
  return 0
}

# Parse the key serial #s from the eml and find a matching key
getSerial() {
  p7m="$1"
  keysDIR="$2"

  # No way to tell diff between an encrypted email & opaque-signed email w/out parsing cms info
  # Encrypted email has "contentType: pkcs7-envelopedData"
  # Opaque-Signed email has "contentType: pkcs7-signedData"
  cmsInfo="$(echo "$p7m" | openssl cms -cmsout -print)"
  # Check for error
  if [[ $? -ne 0 ]]
  then
    return 3
  fi
  isSigned=$(echo "$cmsInfo" | grep -c 'contentType: pkcs7-signedData')
  if [[ $isSigned -gt 0 ]]
  then
    # opaque signed email - don't need a key
    return 2
  fi

  # Encrypted email - get list of key serail #s that can decipher
  serials="$(echo "$cmsInfo" | grep serial | cut -f 2 -d ':' | sed -e 's/^[[:space:]]*//')"
  # for ea serial, see if we have that key
  for s in $(echo "$serials")
  do
    # serial can be listed in either decimal or hex format
    # assume key file is named in hex format
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
  echo "$p7m" | openssl cms -decrypt -inkey "$keyPath" -passin env:PW_KEY
}

# Get the header from the original email
# Don't include content-type or boundary - will be replaced from content-type and boundary of PT
getHeader() {
  eml="$1"
  stop="MIME-Version: 1.0"
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

# Log Exceptions into a tsv file
except() {
  EML_PATH="$1"
  REASON="$2"
  header="$3"

  # using funky sed code because you can have multi-line fields - continuing lines will start w/ white-space
  FROM=$(echo "$header" | sed -e '/^$/q;/^From:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  TO=$(echo "$header" | sed -e '/^$/q;/^To:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  CC=$(echo "$header" | sed -e '/^$/q;/^CC:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  BCC=$(echo "$header" | sed -e '/^$/q;/^BCC:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  SUBJECT=$(echo "$header" | sed -e '/^$/q;/^Subject:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  THREAD_TOPIC=$(echo "$header" | sed -e '/^$/q;/^Thread-Topic:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr '\n\t' ' ')
  THREAD_INDEX=$(echo "$header" | sed -e '/^$/q;/^Thread-Index:/!d;n;:c;/^\s/!d;n;bc' | sed 's/.*: //' | tr -d '\n\t')
  DATE=$(echo "$header" | grep '^Date:' | sed 's/.*: //')
  DATE_FMT=$(date --utc --date="$(echo $DATE)" +'%D %T')
  MESSAGE_ID=$(echo "$header" | grep -A1 '^Message-ID:' | awk -F'[<,>]' '{print $2}' | tr -d '\n')
  # list attachments but filter out smime.p7m and rtf-body.rtf
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
  serialExitCode=$?
  if [[ $serialExitCode -eq 1 ]]
  then
    except "$filename" "Missing Key" "$(getHeader "$eml")"
    output "$exceptionsDIR/nokeys/$filename" "$eml"
    exit 1
  elif [[ $serialExitCode -eq 2 ]]
  then
    # decipher opaque-signed email
    PT="$(echo "$p7m" | openssl cms -verify -nosigs -noverify)"
    # If successful output to PT
    if [[ $? -eq 0 ]]
    then
      output "$outDIR/$filename" "$(assemble "$eml" "$PT")"
      exit 0
    # Else output to exceptions
    else
      except "$filename" "Opaque-Signed failed to verify" "$(getHeader "$eml")"
      output "$exceptionsDIR/signed/$filename" "$eml"
      exit 1
    fi
  elif [[ $serialExitCode -eq 3 ]]
  then
    # OpenSSL couldn't parse the smime.p7m
    except "$filename" "OpenSSL CMS failed to parse smime.p7m" "$(getHeader "$eml")"
    exit 1
  fi
  # Decipher
  keyPath="$keysDIR/$serial.key"
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

echo "*** Starting    $(date)"

# iterate through unpacked PST
cd "$tmpfsPath"
find . -type f -name "*.eml" -print0 | parallel -0 --bar pipeline {} $tmpfsPath $outDIR $keysDIR $exceptionsDIR

echo "*** Done    $(date)"
