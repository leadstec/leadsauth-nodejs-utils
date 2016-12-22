#!/bin/bash

. scripts/version.sh

set -v

function waitForServer {
  # Give the server some time to start up. Look for a well-known
  # bit of text in the log file. Try at most 50 times before giving up.
  C=50
  while [ $C -gt 0 ]
  do
    grep "LeadsAuth ${VERSION} (WildFly Core 2.0.10.Final) started" leadsauth.log
    if [ $? -eq 0 ]; then
      echo "Server started."
      C=0
    else
      echo -n "."
      C=$(( $C - 1 ))
    fi
    sleep 1
  done
}

ARCHIVE="${LEADSAUTH}.tar.gz"
URL="http://repo.lxpt.cn/artifactory/leadsauth/${VERSION}/${ARCHIVE}"

# Download leadsauth server if we don't already have it
if [ ! -e $LEADSAUTH ]
then
  wget $URL
  tar xzf $ARCHIVE
  rm -f $ARCHIVE
fi

# Start the server
$LEADSAUTH/bin/standalone.sh -Djava.net.preferIPv4Stack=true \
                            -Dleadsauth.migration.action=import \
                            -Dleadsauth.migration.provider=singleFile \
                            -Dleadsauth.migration.file=test/fixtures/leadsauth-fixture.json \
                            -Dleadsauth.migration.strategy=OVERWRITE_EXISTING > leadsauth.log 2>&1 &

waitForServer