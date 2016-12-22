#!/bin/bash

. scripts/version.sh

${LEADSAUTH}/bin/jboss-cli.sh --connect command=:shutdown
