Describe "Extract PST files"
  It "It inputs a DIR of PSTs and ouptuts a DIR of RFC eml files for each PST"
    rm -rf workspace/testXtractOut/*
    When run source lib/xtractPSTs.bash workspace/testXtractIn workspace/testXtractOut
    testOutEml=$(head -n 7 'workspace/testXtractOut/TEST/Sent Items/1.eml')
    expected='From: "General William C. Lee" <sender@local>
To: "101st Airborne Division" <recip@local>
Subject: rendezvous with destiny
Date: 19 Aug 1942 01:00:00 +0000
Status: RO
MIME-Version: 1.0
Content-Type: multipart/mixed;'
    The variable testOutEml should eq "$expected"
  End
End