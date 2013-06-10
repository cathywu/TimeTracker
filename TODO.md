
Things to Do
============

Performance Enhancements
------------------------

Right now, the TimeTracker Explorer is unusable if you have more than a few months' worth of data.  A few things could improve this:

 + Split the array of records into a record of arrays.  This would help the JIT and garbage collector better manage the data.
 
 + Switch to a FloatArray on supported browsers, for the date information.  This would make a few operations on that array a lot faster.
 
 + Switch to requesting and using only a portion of the data, using perhaps an HTTP Range request.  This requires rewriting the web server -- instead of just SimpleHTTPServer, we'd need to add Range request support.

User Interface Fixes
--------------------

The user interface for the Explorer is rough-hewn.  A few simple changes would improve it.

 + It's basically impossible to tell which searches correspond to which color.  If existing searches were to display their color, and also possibly have widgets for editing or removing them, things would be easier.
 
 + It's confusing that the first search grays out some boxes.  Maybe the gray could be darker, and then start off like that?
 
 + Hitting the Enter key in the search box reloads the page instead of searching.

 + The list of window titles when you click on a block needs a better title, a better UI, and some tools to discover more good searches.
