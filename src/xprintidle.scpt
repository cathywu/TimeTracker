# Emulates Unix xprintidle
# src: http://macscripter.net/viewtopic.php?id=19435

set idleTime to (do shell script "ioreg -c IOHIDSystem | perl -ane 'if (/Idle/) {$idle=(pop @F)/1000000; print $idle,\"\";last}'")
