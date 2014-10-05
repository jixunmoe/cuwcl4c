#!/bin/bash

if ! type curl > /dev/null 2>&1; then {
	echo Please install curl first.;
	exit 1;
}; fi

if [ `id -u` -ne 0 ]; then {
	echo Please run as root;
	su -c "_H='`realpath ~`' bash '$0'"
	exit ;
}; fi

if [ -z "$_H" ]; then {
	_H=`realpath ~`;
}; fi

OUT=/opt/CUWCL4C/
fnScript=downloader.sh
deskFile=zCUWCL4C.desktop

mkdir -p $OUT
echo Please enter your prefered download directory.
echo -e "You can leave this blank to use \e[0;34m$_H/Download\e[0m"
read -p ' > ' targetDir

if [ -z "$targetDir" ]; then {
	targetDir=$_H/Download
}; fi

mkdir -p "$targetDir"
echo -e "\e[1A > \e[0;34m$targetDir\e[0m";
read -p "Permission [a+rw, or Q don't touch it] > " perm

if [ 'Q' != "$perm" ]; then {
	if [ -z "$perm" ]; then { perm='a+rw'; }; fi; 
	echo -en " ..  Set permission to \e[0;34m${perm}\e[0m...";
	chmod "$perm" "$targetDir";
	echo -e '\r[\e[1;32mOK\e[0m]'
}; fi

targetDir=`realpath "$targetDir/"`

# echo -e "Download directory has been set to: \e[0;34m$targetDir\e[0m"

cp ./$fnScript $OUT$fnScript
cat >/usr/share/applications/$deskFile <<__EOF__
[Desktop Entry]
Encoding=UTF-8
Version=1.0
Type=Application
Terminal=true
Exec=env dlDir='$targetDir' $OUT$fnScript %u
Categories=Application;

Name=CUWCL4C URI downloader
Comment=CUWCL4C URI
MimeType=x-scheme-handler/cuwcl4c;
__EOF__

echo 'Update desktop database...'
update-desktop-database

echo 'Finish! Enjoy~';