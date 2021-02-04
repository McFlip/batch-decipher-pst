Describe "lib/xtractPSTs.bash"
  It "Inputs a DIR of PSTs and ouptuts a DIR of RFC eml files for each PST"
    actual=$(head -n 7 'workspace/tests/XtractOut/TEST/Sent Items/1.eml')
    expected=$(cat spec/expectedHeader.txt)
    inDir="workspace/tests/XtractIn"
    outDir="workspace/tests/XtractOut"

    When run source lib/xtractPSTs.bash $inDir $outDir
    The variable actual should equal "$expected"
    The output should include '"Inbox" - 2 items done, 0 items skipped.'
    The output should include '"down" - 1 items done, 0 items skipped.'
    The output should include '"deep" - 1 items done, 0 items skipped.'
    The output should include '"buried" - 1 items done, 0 items skipped.'
  End
End