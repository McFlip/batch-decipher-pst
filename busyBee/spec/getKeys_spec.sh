Describe "Unpack p12 containers to get key files that will be used to decipher emails"
  It "Iterates through a dir of p12 files and exports the key encrypted to the output dir"
    When run source getKeys.bash workspace/tests/getKeysIn workspace/tests/getKeysOut workspace/tests/getKeysSecrets/passwords
    actual=$(openssl pkey -passin pass:MrGlitter -in workspace/tests/getKeysOut/12C3905B55296E401270C0CEB18B5BA660DB9A1F.key)
    expected=$(cat spec/expectedKey.txt)
    The variable actual should eq "$expected"
  End
  It "Exports a table mapping p12 filenames to serial numbers"
    actual=$(cat workspace/tests/getKeysOut/serials.tsv)
    expected="TEST.p12	12C3905B55296E401270C0CEB18B5BA660DB9A1F"
    The variable actual should eq "$expected"
  End
End
