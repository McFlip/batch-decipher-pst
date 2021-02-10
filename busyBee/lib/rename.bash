#!/bin/bash
# rename PST files to avaoid spaces and long paths

inDIR="$1"
i=0
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")
for pst in $(find "$inDIR" -type f -name "*.pst")
do
  mv "$pst" "${1%/}/$i.pst"
  i=$((i+1))
done
IFS=$SAVEIFS