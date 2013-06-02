#!/usr/bin/env python3
"""
Track the currently-active window.  Periodically print the title of
the currently-active window and write it to a file.
"""

import time, subprocess, sys
import os

SRCDIR = os.path.realpath(__file__)
BACKENDS = {"auto": None}

def call_process(shell_cmd):
    p = subprocess.Popen(shell_cmd, shell=True, stdout=subprocess.PIPE)
    out, _ = p.communicate()
    return out.decode("utf-8")

def backend(name):
    def decorator(cls):
        BACKENDS[name] = cls
        return cls
    return decorator

def get_backend(name):
    if name != "auto": return BACKENDS[name]

    platform = sys.platform
    try:
        return get_backend({"linux": "x11", "darwin": "osx"}[platform])
    except KeyError:
        raise Exception("Can't identify the operating system.  "
                        "Please specify the os on the command line")

@backend("x11")
class X11:
    @staticmethod
    def idle_time_ms():
        return int(call_process("xprintidle").strip())
    
    @staticmethod
    def active_window_title():

        xprop_line = call_process("xprop _NET_WM_NAME -id `xdotool getwindowfocus`")
    
        XPROP_PREFIX = "_NET_WM_NAME(UTF8_STRING) = "
        XPROP_ERROR  = "_NET_WM_NAME:  not found.\n"
        if xprop_line.startswith(XPROP_PREFIX):
            name = xprop_line[len(XPROP_PREFIX):]
            name = name.strip().strip("\"")
            return name
        elif xprop_line.startswith(XPROP_ERROR):
            return "<error>window name not found</error>"
        else:
            print("Cannot parse XPROP line: {}".format(repr(xprop_line)), file=sys.stderr)
            return None

@backend("osx")
class OSX:
    @staticmethod
    def idle_time_ms():
        script = os.path.join(SRCDIR, "osx_printidle.scpt")
        return call_process(["osascript", script]).rstrip("\n")

    @staticmethod
    def active_window_title():
        script = os.path.join(SRCDIR, "osx_gettitle.scpt")
        return os.popen(["osascript", script]).rstrip("\n")

def printer(buffer=None, file=sys.stdout):
    start_time = time.time()
    buffered = []

    def print(*args):
        nonlocal start_time

        now = time.time()
        if buffer is None or now - start_time > float(buffer):
            for old_args in buffered:
                file.write(*old_args)
                file.write("\n")
            file.write(*args)
            file.write("\n")
            file.flush()
            start_time = now
        else:
            buffered.append(args)

    return print

def track(opts):
    backend = opts.os

    if backend.idle_time_ms() > opts.idle*1000: # Idle for over 30 seconds
        return

    title = backend.active_window_title()

    if title:
        now = time.localtime()
        now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
        opts.print("{}\t{}".format(now_iso, title))
    else:
        pass

def main(opts):
    while True:
        track(opts)
        time.sleep(opts.interval)

def parse_args():
    import argparse
    parser = argparse.ArgumentParser(description=sys.modules[__name__].__doc__)

    parser.add_argument("-i", "--interval", type=float, default=1.0,
                        help="How often to print the title of the active window.")

    parser.add_argument("-I", "--idle", type=float, default=30.0,
                        help="How many seconds of idleness to turn off after.")

    parser.add_argument("--os", type=get_backend, default="auto",
                        help="Which OS and window system do you use?")

    parser.add_argument("--format", default="%Y-%m-%d %H:%M:%S",
                        help="strftime(3)-like format for writing out the time.")

    parser.add_argument("-b", "--buffer",
                        help="How many seconds to buffer output lines for.")

    parser.add_argument("-f", "--file", type=argparse.FileType("at"),
                        default=sys.stdout,
                        help="Which file to write output to.")
    
    return parser.parse_args()

if __name__ == "__main__":
    opts = parse_args()
    opts.print = printer(opts.buffer, opts.file)
    main(opts)
