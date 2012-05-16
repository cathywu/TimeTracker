#!/usr/bin/env python
import threading
import os, re, time
import focus_globals as pglobals

"""
Computer use time tracker

@author cathywu
@date 05-15-2012
@version 2.0
"""

def tracker():
    threading.Timer(1.0,tracker).start() # repeat in 1 second

    # sketchy utilities to get window title
    inp = os.popen("xdotool getwindowfocus | xargs xprop _NET_WM_NAME -id")
    result = re.match('_NET_WM_NAME\(UTF8_STRING\) = "(?P<window_name>.*)"', inp.readline())

    # skip queries that don't match regex
    # FIXME figure out why they don't match
    nm = result.groupdict()['window_name']
    if nm:
        tm = time.localtime()
        f = open(get_filename(tm), "a")
        tofday = time.strftime("%H:%M:%S", tm)
        f.write(tofday + " => " + nm + "\n")
        f.close()
    # TODO else, log the bad window title
    
def get_filename(t):
    return pglobals.data_base % {'date': time.strftime("%Y-%m-%d", t)}

if __name__ == "__main__":
    tracker()
