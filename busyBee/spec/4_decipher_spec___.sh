Describe "decipher.bash"
  Pending "Deciphers encrypted emails. Input is a dir of PSTs. Output is a dir of RFC eml files mirroring the structure of the PSTs."
    # actual=$(cat workspace/decipherOut/TEST/Inbox/1.eml)
    # expected=$(cat spec/expectedPT.txt)
    inDir="workspace/tests/decipherIn"
    outDir="workspace/tests/decipherOut"
    secretsDir="workspace/tests/decipherSecrets"

    # When run source decipher.bash $inDir $outDir $secretsDir
    # The variable actual should equal "$expected"
  End
End
