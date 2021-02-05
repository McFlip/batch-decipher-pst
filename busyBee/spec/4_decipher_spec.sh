Describe "decipher.bash"
  Pending "Work in Progress"

  It "Deciphers encrypted emails. Input is a dir of PSTs. Output is a dir of RFC eml files mirroring the structure of the PSTs."
    inDir="workspace/tests/decipherIn"
    outDir="workspace/tests/decipherOut"
    secretsDir="workspace/tests/decipherSecrets"
    expected=$(cat spec/expectedPT.txt)
    actual="workspace/tests/decipherOut/TEST/Inbox/buried/deep/down/1.eml"

    When run source decipher.bash $inDir $outDir $secretsDir
    The contents of file $actual should equal "$expected"
  End
End
