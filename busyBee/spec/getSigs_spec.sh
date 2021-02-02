expected="\
serial=12C3905B55296E401270C0CEB18B5BA660DB9A1F
subject=
    countryName               = US
    stateOrProvinceName       = FL
    localityName              = Jacksonville
    organizationName          = USACE
    organizationalUnitName    = Forensics
    commonName                = LAST.FIRST.MIDDLE.12345678
    emailAddress              = Grady.C.Denton@usace.army.mil
notBefore=Apr 17 15:56:38 2020 GMT
notAfter=Apr 17 15:56:38 2021 GMT
Grady.C.Denton@usace.army.mil
issuer=
    countryName               = US
    stateOrProvinceName       = FL
    localityName              = Jacksonville
    organizationName          = USACE
    organizationalUnitName    = Forensics
    commonName                = LAST.FIRST.MIDDLE.12345678
    emailAddress              = Grady.C.Denton@usace.army.mil"

Describe "Get Custodian Cert Info for Request to Army/DISA"
  It "Iterates through input dir and parses certificates from signed emails.\
      Outputs individual certs as well as concat all certs into file within output dir."
    When run source getSigs.bash workspace/tests/getSigsIn workspace/tests/getSigsOut
    actual=$(cat workspace/tests/getSigsOut/allCerts.txt)
    The variable actual should eq "$expected"
  End
End