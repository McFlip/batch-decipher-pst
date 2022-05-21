Describe "getSigs.bash"

  # cleanup() {
  #   find workspace/getSigsIn/ -type d -mindepth 1 -maxdepth 1 -exec rm -rf {} \;
  # }
  # AfterEach 'cleanup'

  It "Gets Custodian Cert Info for Request to RA/CA. Iterates through input dir of PST files and parses certificates from signed emails. Outputs individual certs as well as concat all certs into file within output dir."
    inDir="workspace/pst"
    outDir="workspace/getSigsOut"
    custodians="workspace/custodians.txt"
    expected=$(cat spec/expectedCert.txt)

    When run source getSigs.bash $inDir $outDir $custodians
    actual="workspace/getSigsOut/allCerts.txt"
    The contents of file $actual should equal "$expected"
  End
End