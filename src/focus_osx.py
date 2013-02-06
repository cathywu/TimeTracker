#!/Library/Frameworks/Python.framework/Versions/Current/bin/python
import threading
import os, re, time
import focus_globals as pglobals

"""
Computer use time tracker for OSX

@author cathywu
@date 02-06-2013
@version 2.1
"""

def get_idle_time_ms():
    imp = os.popen("osascript %s/xprintidle.scpt" % pglobals.src_dir)
    return float(imp.readline().rstrip('\n'))

def tracker():
    global buf
    threading.Timer(1.0,tracker).start() # repeat in 1 second

    # don't record when computer is idle
    if get_idle_time_ms() > 30000:
        return

    # sketchy applescripts to get window title
    inp = os.popen("osascript %s/getwindowfocus.scpt" % pglobals.src_dir)
    result = inp.readline().rstrip('\n')

    # record window title in format: time => title
    if result:
        tm = time.localtime()
        tofday = time.strftime("%H:%M:%S", tm)
        buf.append("%s => %s\n" % (tofday,result))

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
