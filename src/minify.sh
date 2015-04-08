#!/bin/sh

echo_run() {
    echo "$*"
    eval "$*"
}

path=`which uglifyjs`
if [ -z "$path" ]; then
    echo "You'll need to install Node and uglifyjs:"
    echo "npm install -g uglify-js"
    exit 1
fi

echo_run "uglifyjs --compress --screw-ie8 --lint datepickr.js >datepickr.min.js"
