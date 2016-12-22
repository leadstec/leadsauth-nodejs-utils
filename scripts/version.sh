#!/bin/bash

export VERSION=`curl -s http://www.leadstec.com/leadsauth | grep -i version | head -n1 | grep -o "'.*'" | sed -e "s/'//g"`
export LEADSAUTH="leadsauth-${VERSION}"
