#!/bin/bash

BASE_DIR=`dirname $0`

echo ""
echo "Starting Karma Server"
echo "-------------------------------------------------------------------"

karma start $BASE_DIR/../config/unit.conf.js $*
