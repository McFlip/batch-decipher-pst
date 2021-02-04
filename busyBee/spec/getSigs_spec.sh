Describe "Get Custodian Cert Info for Request to Army/DISA"
  It "Iterates through input dir and parses certificates from signed emails. Outputs individual certs as well as concat all certs into file within output dir."
    When run source getSigs.bash workspace/tests/getSigsIn workspace/tests/getSigsOut
    expected=$(cat spec/expectedCert.txt)
    actual=$(cat workspace/tests/getSigsOut/allCerts.txt)
    The variable actual should eq "$expected"
  End
End