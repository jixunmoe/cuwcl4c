#!/bin/sh
n=

if type node ; then
	n=node
else
	if type nodejs ; then
		n=nodejs
	else
		echo Please install nodejs first! ;
		exit 1;
	fi
fi

$n build.js -main -readme-zh-TW -readme && git commit -a;