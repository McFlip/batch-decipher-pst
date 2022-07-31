Describe "getKeys.bash"
  actual() {
    openssl pkey -passin pass:MrGlitter -in workspace/getKeysOut/12C3905B55296E401270C0CEB18B5BA660DB9A1F.key
  }

  It "Iterates through a dir of p12 files and exports the encrypted key to the output dir"
    expected=$(cat spec/expectedKey.txt)
    inDir="workspace/p12"
    outDir="workspace/getKeysOut"
    export PW_P12="MrGlitter"
    export PW_KEY="MrGlitter"

    When run source getKeys.bash $inDir $outDir
    The result of function actual should eq "$expected"
  End
End
