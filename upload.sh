#!/usr/bin/env bash

ng build --prod --base-href /upload/prime-hash-helper/ --deploy-url /upload/prime-hash-helper/

RELEASE_DIR="/srv/http/root/upload/prime-hash-helper"

rsync -ahv --delete "dist/" "pwootage@new.pwootage.com:${RELEASE_DIR}"
