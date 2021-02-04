Describe "getSigs.bash"
  It "Gets Custodian Cert Info for Request to RA/CA. Iterates through input dir and parses certificates from signed emails. Outputs individual certs as well as concat all certs into file within output dir."
    actual=$(cat workspace/tests/getSigsOut/allCerts.txt)
    expected=$(cat spec/expectedCert.txt)
    inDir="workspace/tests/getSigsIn"
    outDir="workspace/tests/getSigsOut"
    
    When run source getSigs.bash $inDir $outDir
    The variable actual should equal "$expected"
    The line 1 of output should equal "serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F"
  End
End