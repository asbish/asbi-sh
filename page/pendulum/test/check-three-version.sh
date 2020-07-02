#!/usr/bin/env bash

PROJ_DIR=$(cd $(dirname $0); pwd)/..

PACKAGE_THREE_VER=$(cat ${PROJ_DIR}/package.json | jq -r '.dependencies.three')
CDN_THREE_VER=$(grep -Po '(?<=three@)[\d.]+' ${PROJ_DIR}/src/index.html)

if [ ${PACKAGE_THREE_VER} != ${CDN_THREE_VER} ]; then
    echo -e "\e[31mpage/pendulum: CDN three version doesn't match with the version in package.json (${CDN_THREE_VER} != ${PACKAGE_THREE_VER})\e[m"
    exit 1
fi
