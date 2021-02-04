Describe "Extract PST files"
  It "It inputs a DIR of PSTs and ouptuts a DIR of RFC eml files for each PST"
    rm -rf workspace/testXtractOut/*
    When run source lib/xtractPSTs.bash workspace/tests/XtractIn workspace/tests/XtractOut
    actual=$(head -n 7 'workspace/tests/XtractOut/TEST/Sent Items/1.eml')
    expected=$(cat spec/expectedHeader.txt)
    The variable actual should eq "$expected"
  End
End