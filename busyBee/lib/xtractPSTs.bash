#!/bin/bash
# Utility for extracting a single input PST to a single output folder of RFC compliant ".eml" files
# Usage: xtractPSTs.bash inputPST outputDirectory

# get number of available proc cores
NPROC=$(nproc)
inPST="$1"
outDIR=$2

# read in the pst file
# -> output to the DIR from argument
# -> parse only emails
# -> mirror folder structure; add the '.eml' extension to ea file
# -> max parallelization
readpst -o "$outDIR" -t e -e -j $NPROC "$inPST"
