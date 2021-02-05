#!/bin/bash
# Utility for extracting a input folder of PSTs to a single output folder of RFC compliant ".eml" files
# Usage: xtractPSTs.bash inputDirectory outputDirectory

# get number of available proc cores
NPROC=$(nproc)
inDIR=$1
outDIR=$2

# Get list of PST files to process
pstList=$(find "$inDIR" -name "*.pst")
for pst in $pstList
do
  # read in the pst file
  # -> output to the DIR from argument
  # -> parse only emails
  # -> mirror folder structure; add the '.eml' extension to ea file
  # -> max parallelization
  readpst -o "$outDIR" -t e -e -j $NPROC "$pst"
done
