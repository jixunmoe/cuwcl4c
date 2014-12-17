#!/bin/sh
# Create new file for testing, 512 kb null bytes file
dd if=/dev/zero of=test.nil bs=1024 count=512