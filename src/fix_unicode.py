#!/usr/bin/env python3
"""
Decode the Unicode escapes in earlier versions of TimeTracker.

Prior to r5707ac4, TimeTracker running on X11 would incorrectly handle
window titles containing Unicode characters. This script corrects logs
created with these earlier versions of TimeTracker.
"""

from timetracker import process_escapes

def correct_file(fn):
    with open(fn, "rt", encoding="utf-8") as f:
        wrong_text = f.read()
    right_text = process_escapes(wrong_text)
    with open(fn, "wt", encoding="utf-8") as f:
        f.write(right_text)

if __name__ == "__main__":
    import sys
    import os

    for fn in sys.argv[1:]:
        correct_file(os.path.realpath(os.path.expanduser(fn)))
