#!/bin/bash

# Scaffolds the test data folder before running tests

cd ..
mkdir -p workspace
cp -r ../data/{keys,p12,pst} workspace/
cp ../data/custodians.txt workspace/
mkdir workspace/{XtractOut,getSigsIn,getSigsOut,getKeysOut,decipherOut,decipherExceptions}