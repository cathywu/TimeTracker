TimeTracker
=================
A simple script to keep track of computer usage. It logs locally the active window title for every second of computer use.

FEATURES
----------------
- Sleeps when the computer is idle
- Supports multiple computers (synced via Dropbox)
- Includes basic analytics script

SUPPORTED PLATFORMS
-----------------
Known to work on:
- Ubuntu 10.04
- Ubuntu 11.04
- Ubuntu 12.04
- OSX Snow Leopard

Known to NOT work on:
- ??

DEPENDENCIES
-----------------
- xprintidle
- xdotool

Install these using: `sudo apt-get install <DEPENDENCY>`

SETUP
-----------------
- Set data_dir in src/focus_globals.py. This is where the data is logged.
- Create data_dir, typically: `mkdir data`
- On Ubuntu, run gnome-session-properties and add to startup applications:
    `<PATH-TO-TIMETRACKER>/src/focus.py >> /tmp/timetracker.log`
- On OSX, copy the plist file to the LaunchAgents directory: $ `cd com.timetracker.plist ~/Library/LaunchAgents`
    - Load the LaunchAgent: $ `launchctl load /Users/cathywu/Library/LaunchAgents/com.timetracker.plist`
    - Start the LaunchAgent: $ `launchctl start com.timetracker`
- Alternatively, just run it manually
- For simple analytics, run: $ `python src/stats.py`
