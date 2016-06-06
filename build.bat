@echo off
REM node build.js -main -readme-zh-TW -readme
REM git commit -a
pushd %~dp0
if not exist obj mkdir obj

REM Compile Loader
call tsc --out obj/loader.js src/loader/Loader.ts

REM Compile main module
call tsc --out obj/stage1.js src/EntryPoint.ts --module AMD

REM Compile meta
node compile.js -out=obj/meta.js -input=src/meta.js

copy /b obj\meta.js+obj\loader.js+obj\stage1.js out\script.js /y

