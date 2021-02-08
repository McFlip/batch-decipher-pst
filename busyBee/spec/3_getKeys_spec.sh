Describe "getKeys.bash"
  actual() {
    openssl pkey -passin pass:MrGlitter -in workspace/tests/getKeysOut/12C3905B55296E401270C0CEB18B5BA660DB9A1F.key
  }

  It "Iterates through a dir of p12 files and exports the encrypted key to the output dir"
    expected=$(cat spec/expectedKey.txt)
    inDir="workspace/tests/getKeysIn"
    outDir="workspace/tests/getKeysOut"
    passwords="workspace/tests/getKeysSecrets/passwords"

    When run source getKeys.bash $inDir $outDir $passwords
    The result of function actual should eq "$expected"
  End
  It "Exports a table mapping p12 filenames to serial numbers"
    actual="workspace/tests/getKeysOut/serials.tsv"
    expected="TEST.p12	12C3905B55296E401270C0CEB18B5BA660DB9A1F"
    The contents of file $actual should eq "$expected"
  End
End
