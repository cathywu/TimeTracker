TimeTracker
=================
A simple script to keep track of computer usage. It logs locally the active window title for every second of computer use.

SUPPORTED PLATFORMS
-----------------
Known to work on:
- Ubuntu 10.04
- Ubuntu 11.04
- Ubuntu 12.04

Know to NOT work on:
- OSX (pending)

DEPENDENCIES
-----------------
- xprintidle
- xdotool

Install these using: `sudo apt-get install <DEPENDENCY>`

SETUP
-----------------
- Set data_dir in src/focus_globals.py
- Create data_dir, typically: `mkdir data`
- In Ubuntu, run gnome-session-properties and add startup applications:
    `<PATH-TO-TIMETRACKER>/src/focus.py >> /tmp/timetracker.log`
- Alternatively, just run it manually
