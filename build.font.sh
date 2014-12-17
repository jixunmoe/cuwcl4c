#!/bin/sh
# http://marcos.ciarrocchi.me/post/31528113859/how-to-fix-firefox-font-face-cross-domain-issues-on
cat res/font.svg | base64 | tr -d '\n' > res/font.svg.base64