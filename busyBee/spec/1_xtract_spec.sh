Describe "lib/xtractPSTs.bash"

  cleanup() {
    find "workspace/XtractOut/" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} \;
  }
  AfterEach 'cleanup'

  actual() {
    head -n 7 'workspace/XtractOut/TEST/Sent Items/1.eml'
  }

  It "Inputs a DIR of PSTs and ouptuts a DIR of RFC eml files for each PST"
    inPST="workspace/pst/TEST.pst"
    outDir="workspace/XtractOut"
    expected=$(cat spec/expectedHeader.txt)

    When run source lib/xtractPSTs.bash $inPST $outDir
    The result of function actual should equal "$expected"
    The output should include '"Inbox" - 2 items done, 0 items skipped.'
    The output should include '"down" - 1 items done, 0 items skipped.'
    The output should include '"deep" - 1 items done, 0 items skipped.'
    The output should include '"buried" - 1 items done, 0 items skipped.'
  End
End