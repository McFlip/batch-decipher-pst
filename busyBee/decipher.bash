#!/bin/bash
# Deciphers a batch of PSTs containing encrypted mail. Outputs RFC eml files in a directory structure that mirrors the PSTs.
# Key passwords will be passed using Docker Secrets.
# In production set secretsPath to "/run/secrets/<caseName>_keyPWs"
# The input secret is a tsv file in the form "keySerial#    keyPassword"
# Passwords will never be stored to the FS.
# Decrypted mail will be stored unencrypted!
# Use proper security measures to safeguard the Plain Text output.
# Usage: decipher.bash inputDirectory outputDirectory secretsPath exceptionsDirectory

inDIR="$1"
outDIR="$2"
secretsPath="$3"
exceptionsDIR="$4"

# Cleanup previous runs
find "$outDIR" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;

# Extract PSTs
bash lib/xtractPSTs.bash "$inDIR" "$inDIR"

# *** FUNCTIONS ***

# *** MAIN PROCEDURE ***

