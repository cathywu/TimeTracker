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

def get_idle_time_ms():
    imp = os.popen("xprintidle")
    return int(imp.readline())

def tracker():
    global buf
    threading.Timer(1.0,tracker).start() # repeat in 1 second

    # don't record when computer is idle
    if get_idle_time_ms() > 30000:
        return

    # sketchy utilities to get window title
    inp = os.popen("xdotool getwindowfocus | xargs xprop _NET_WM_NAME -id")
    result = re.match('_NET_WM_NAME\(UTF8_STRING\) = "(?P<window_name>.*)"', inp.readline())

    # record window title in format: time => title
    if result:
        nm = result.groupdict()['window_name']
        tm = time.localtime()
        tofday = time.strftime("%H:%M:%S", tm)
        buf.append("%s => %s\n" % (tofday,nm))
    # skip queries that don't match regex
    # FIXME figure out why they don't match
    # TODO else, log the bad window title

    # clear buffer when it gets too large (30 seconds)
    if len(buf) > 30:
        f = open(get_filename(tm), "a")
        for line in buf:
            f.write(line)
        f.close()
        buf = [] # clear buffer
    
def get_filename(t):
    return pglobals.data_base % {'date': time.strftime("%Y-%m-%d", t)}

if __name__ == "__main__":
    buf = [] # buffer to hold window titles and decrease disk access
    tracker()
