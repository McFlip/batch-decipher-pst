Describe "getSigs.bash"

  cleanup() {
    find workspace/tests/getSigsIn/ -type d -mindepth 1 -maxdepth 1 -exec rm -rf {} \;
  }
  AfterEach 'cleanup'

  It "Gets Custodian Cert Info for Request to RA/CA. Iterates through input dir of PST files and parses certificates from signed emails. Outputs individual certs as well as concat all certs into file within output dir."
    inDir="workspace/tests/getSigsIn"
    outDir="workspace/tests/getSigsOut"
    actual=$(cat workspace/tests/getSigsOut/allCerts.txt)
    expected=$(cat spec/expectedCert.txt)

    When run source getSigs.bash $inDir $outDir
    The variable actual should equal "$expected"
    The line 3 of output should end with '"TEST_signed" - 2 items done, 0 items skipped.'
    The line 4 of output should equal "serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F"
  End
End