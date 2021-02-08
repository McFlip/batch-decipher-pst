Describe "decipher.bash"
  cleanup() {
    find "workspace/tests/decipherIn/" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
  }
  AfterEach 'cleanup'

  It "Deciphers encrypted emails. Input is a dir of PSTs. Output is a dir of RFC eml files mirroring the structure of the PSTs."
    inDir="workspace/tests/decipherIn"
    outDir="workspace/tests/decipherOut"
    secretsPath="workspace/tests/decipherSecrets/keyPasswords"
    keysDIR="workspace/tests/decipherKeys"
    exceptionsDir="workspace/tests/cecipherExceptions"
    # Force both expected and actual to Linux line ending by deleting "Carriage Return"
    expected=$(cat spec/expectedPT.txt | sed 's/\x0d//g')
    actual=$(cat "workspace/tests/decipherOut/TEST/Inbox/buried/deep/down/1.eml" | sed 's/\x0d//g')

    When run source decipher.bash "$inDir" "$outDir" "$secretsPath" "$keysDIR" "$exceptionsDIR"
    The variable actual should equal "$expected"
    The line 5 of output should end with 'TEST" - 3 items done, 0 items skipped.'
  End
End
