<!-- -*- type: markdown -*- -->

TimeTracker
===========

A simple script to keep track of computer usage. It logs the title of the currently-active window once a second (unless you're idle).

Features
--------

 + Sleeps when the computer is idle
 + Supports multiple computers (sync-able via Dropbox)
 + Includes basic analytics script

Supported Platforms
-------------------

Support exists for OS X and X11-based Linux.  For OS X, Snow Leopard and above are known to work.  For X11-based Linux, you'll need `xprintidle` and `xdotool`, which are probably available your distro's package manager in packages of the same name.

Usage
-----

The main TimeTracker tool can be started with

    python src/timetracker.py

TimeTracker can be run with no command-line options -- it should print the title of the currently-active window to your terminal, once a second.

 + You can pass `-f <file>` to instead write the log to that file.  The file is only appended to.
 + You can pass `-i <sec>` to change how often the title is printed and `-I <sec>` to change how many seconds of idleness will cause the TimeTracker to turn off.
 + You can pass `--buffer <sec>` to buffer output lines for that many seconds.  This is handy if you're synchronizing the output file over Dropbox or are on an SSD.
 + If the OS auto-detection isn't working, you can pass `--os <os>`, where `<os>` is currently one of `x11` or `osx`.

Exploring the Data
------------------

We've written a simple web application to explore the data you collect.  Run

    make gui FILE=<path-to-log>

to start it.  It might take a while if you have a lot of data; we plan to fix that.  After that, you can reach it by pointing your web browser to

    http://localhost:8000

Autostart
---------

You'll want to set TimeTracker to auto-start.  In Gnome-based Linux (for example, on Ubuntu), you'll want to start `gnome-session-properties` and add a startup application to run:

    <path-to-source>/src/timetracker.py <args>

On a Linux that starts to pure X, you'll want to add a similar line to `.xinitrc` instead:

    <path-to-source>/src/timetracker.py <args> &

On OS X, things are more complicated.  First, edit the file `src/com.timetracker.plist` to add any command-line arguments that you want added.  For example, you'll probably want to specify the output file.  Then, run

    make plist
    launchctl start com.timetracker

to add the application to start every time you log in.

For Developers
--------------

Bugs and TODOs is are tracked on a [Trello board](https://trello.com/board/timetracker/51bfd90728cdf3b260002195).
