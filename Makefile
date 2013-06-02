OS := $(shell uname -s)
FILE := "-"

plist:
	cp src/com.timetracker.plist ~/Library/LaunchAgents
	launchctl load ~/Library/LaunchAgents/com.timetracker.plist

.PHONY: gui
gui: gui/data.jsonp
	(cd gui/ && python -m http.server)

gui/data.jsonp: $(FILE)
	python src/log_to_json.py $(FILE) $@
