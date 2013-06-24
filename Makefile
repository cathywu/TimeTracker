OS := $(shell uname -s)
FILE := "-"

plist:
	cp src/com.timetracker.plist ~/Library/LaunchAgents
	$EDITOR ~/Library/LaunchAgents/com.timetracker.plist
	launchctl unload ~/Library/LaunchAgents/com.timetracker.plist
	launchctl load ~/Library/LaunchAgents/com.timetracker.plist

.PHONY: gui
gui: gui/data.log gui/timetracker.js

gui/data.jsonp: $(FILE)
	python src/log_to_json.py $(FILE) $@

gui/data.log: $(FILE)
	cp $+ $@

gui/timetracker.js: gui/common.js gui/datetime.js gui/searching.js gui/blocks.js gui/load.js gui/timelines.js gui/init.js
	cat $+ > $@
