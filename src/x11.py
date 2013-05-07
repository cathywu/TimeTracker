#!/usr/bin/env python3
import time, subprocess, sys

def call_process(shell_cmd):
    out, _ = subprocess.Popen(shell_cmd, shell=True, stdout=subprocess.PIPE).communicate()
    return out.decode("utf-8")

def get_idle_time_ms():
    return int(call_process("xprintidle").strip())

def get_window_title():
    xprop_line = call_process("xdotool getwindowfocus | xargs xprop _NET_WM_NAME -id")

    XPROP_PREFIX = "_NET_WM_NAME(UTF8_STRING) = "
    if xprop_line.startswith(XPROP_PREFIX):
        name = xprop_line[len(XPROP_PREFIX):]
        name = name.strip().strip("\"")
        return name
    else:
        print("Cannot parse XPROP line: {}".format(repr(xprop_line)), file=sys.stderr)
        return None

def track():
    if get_idle_time_ms() > 30*1000: # Idle for over 30 seconds
        return

    title = get_window_title()

    if title:
        now = time.localtime()
        now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
        print("{}\t{}".format(now_iso, title))
        sys.stdout.flush()
    else:
        pass

def main():
    while True:
        track()
        time.sleep(1)

if __name__ == "__main__":
    main()
