Describe "decipher.bash"
  cleanup() {
    find "workspace/decipherOut/" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
    rm -f "workspace/decipherExceptions/*"
  }
  AfterEach 'cleanup'

  It "Deciphers encrypted emails. Input is a dir of PSTs. Output is a dir of RFC eml files mirroring the structure of the PSTs."
    inDir="/app/workspace/pst"
    outDir="/app/workspace/decipherOut"
    export PW_KEY="MrGlitter"
    keysDIR="/app/workspace/keys"
    exceptionsDir="/app/workspace/decipherExceptions"
    actual="workspace/decipherOut/TEST/Inbox/buried/deep/down/1.eml"

    When run source decipher.bash "$inDir" "$outDir" "$keysDIR" "$exceptionsDIR"
    The contents of file $actual should include "D3333333333333333333"
    The contents of file $actual should include "3333333333333333333Z"
  End
End
