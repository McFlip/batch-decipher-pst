#!/bin/bash
# Deletes given eml file if grep fails to find given pattern
# Used in preprocessing phase
# Usage: filterEml.bash inFile inPattern

inPattern="$1"
inFile="$2"

grep -m 1 -P "$inPattern" "$inFile"
if [[ $? -ne 0 ]]
then
  rm -f "$inFile"
fi