OS := $(shell uname -s)

plist:
	cp src/com.timetracker.plist ~/Library/LaunchAgents
	${EDITOR} ~/Library/LaunchAgents/com.timetracker.plist
	launchctl unload ~/Library/LaunchAgents/com.timetracker.plist
	launchctl load ~/Library/LaunchAgents/com.timetracker.plist
	launchctl start com.timetracker

.PHONY: compile
compile: gui/index.js

gui/index.js: gui/common.js gui/datetime.js gui/searching.js gui/blocks.js gui/load.js gui/timelines.js gui/init.js
	cat $+ > $@
