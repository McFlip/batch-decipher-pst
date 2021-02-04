Describe "getKeys.bash"
  It "Iterates through a dir of p12 files and exports the encrypted key to the output dir"
    actual=$(openssl pkey -passin pass:MrGlitter -in workspace/tests/getKeysOut/12C3905B55296E401270C0CEB18B5BA660DB9A1F.key)
    expected=$(cat spec/expectedKey.txt)
    inDir="workspace/tests/getKeysIn"
    outDir="workspace/tests/getKeysOut"
    passwords="workspace/tests/getKeysSecrets/passwords"

    When run source getKeys.bash $inDir $outDir $passwords
    The variable actual should eq "$expected"
  End
  It "Exports a table mapping p12 filenames to serial numbers"
    actual=$(cat workspace/tests/getKeysOut/serials.tsv)
    expected="TEST.p12	12C3905B55296E401270C0CEB18B5BA660DB9A1F"
    The variable actual should eq "$expected"
  End
End
