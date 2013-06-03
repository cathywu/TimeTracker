OS := $(shell uname -s)
FILE := "-"

plist:
	cp src/com.timetracker.plist ~/Library/LaunchAgents
	launchctl load ~/Library/LaunchAgents/com.timetracker.plist

.PHONY: gui
gui: gui/data.jsonp gui/timetracker.js
	(cd gui/ && python -m http.server)

gui/data.jsonp: $(FILE)
	python src/log_to_json.py $(FILE) $@

gui/timetracker.js: gui/searching.js gui/blocks.js gui/timelines.js gui/init.js
	cat $+ > $@
