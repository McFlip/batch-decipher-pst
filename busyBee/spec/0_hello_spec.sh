Describe 'Testing the Test'
  It 'prints Hello World'
    # When run script hello.bash
    When run source hello.bash
    # When call echo 'Hello World!'
    The output should eq "Hello World!"
  End
End