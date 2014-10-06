#!/bin/bash

# CUWCL4C URI downloader
cd $dlDir

# URLDecode: http://stackoverflow.com/a/6251482
rawUrl=$(echo -e "$(echo "$1" | sed 'y/+/ /; s/%/\\x/g')")
IFS='|' read -a args <<< "$rawUrl"

uriVer="${args[1]}"
if [ '1' != "$uriVer" ]; then {
	echo 'ERROR: Protacal version miss-match.';
	echo "Required: 1";
	echo "Given   : $uriVer"
	read -p ''
	exit 1;
}; fi

dlAddress="${args[2]}"
fileName="${args[3]}"
fullPath="$dlDir/$fileName"

echo;
echo -e "       \e[1;34mFile download\e[0m: $fileName"
echo;

continueFlag=
if [ -z "$fileName" ]; then {
	outCommand='-O';
} else {
	outCommand="-o$fullPath";
	if [ -f "$fullPath" ]; then {
		while true; do
			echo -e 'File already exist, [\e[1;31mA\e[0mbort/\e[1;31mC\e[0montinue/\e[1;31mO\e[0mverwrite]?'
			read -p " > " -n 1 o
			echo -e ''
			case $o in
				[Cc]* ) continueFlag='-C'; break;;
				[Oo]* ) rm "$fullPath"; break;;
				[Aa]* ) exit;;
				* ) echo "Invalid option.";;
			esac
		done
	}; fi
}; fi

reference="${args[4]}"
if [ -z "$reference" ]; then
	reference=$dlAddress;
fi

dlLen=${#dlAddress}
if (( $dlLen > 60)); then {
	dlAddressShown=${dlAddress:0:57}...
} else {
	dlAddressShown=$dlAddress
}; fi

echo -e "  url: \e[0;34m$dlAddressShown\e[0m";
echo -e "   =>  \e[0;34m$fullPath\e[0m";
echo;

curl "$dlAddress" -H 'accept-encoding: gzip,deflate' -H 'accept-language: en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/37.0.2062.120 Chrome/37.0.2062.120 Safari/537.36' -H 'accept: */*' -H 'cache-control: max-age=0' -H "referer: $reference" --compressed "$outCommand" $continueFlag

notify-send "Downloader" "Finished downloading $fileName" -t 5000 -u low
