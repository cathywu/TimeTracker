# Emulates Unix xdotool getwindowfocus | xargs xprop _NEW_WM_NAME -id
# src: http://stackoverflow.com/questions/5292204/macosx-get-foremost-window-title

global frontApp, frontAppName, windowTitle

set windowTitle to ""
tell application "System Events"
    set frontApp to first application process whose frontmost is true
    set frontAppName to name of frontApp
    tell process frontAppName
        tell (1st window whose value of attribute "AXMain" is true)
            set windowTitle to value of attribute "AXTitle"
        end tell
    end tell
end tell

return {frontAppName, windowTitle}
