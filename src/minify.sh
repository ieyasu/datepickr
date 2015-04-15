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

path=`which minify`
if [ -z "$path" ]; then
    echo "You'll need to install Node and minify:"
    echo "npm install -g minify"
    exit 1
fi

echo_run "uglifyjs --screw-ie8 --lint -c unsafe -m -- dpdate.js datepickr.js >datepickr.min.js"

echo_run "minify datepickr.css"
