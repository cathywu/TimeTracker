#!/usr/bin/env python3

import sys
import os
import datetime

INFILE  = open(sys.argv[1]) if len(sys.argv) > 1 else sys.stdin
OUTFILE = open(sys.argv[2], "w") if len(sys.argv) > 2 else sys.stdout

with INFILE as f:
    data = []

    for line in f:
        date, title = line.split("\t", 1);
        ts = datetime.datetime.strptime(date, "%Y-%m-%d %H:%M:%S")
        data.append([ts.ctime(), title[:-1]])

with OUTFILE as f:
    f.write("load_data(")
    f.write(str(data))
    f.write(")")
