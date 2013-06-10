
Things to Do
============

Performance Enhancements
------------------------

Right now, the TimeTracker Explorer is unusable if you have more than a few months' worth of data.  A few things could improve this:

 + Split the array of records into a record of arrays.  This would help the JIT and garbage collector better manage the data.
 
 + Switch to a FloatArray on supported browsers, for the date information.  This would make a few operations on that array a lot faster.
 
 + Switch to requesting and using only a portion of the data, using perhaps an HTTP Range request.  This requires rewriting the web server -- instead of just SimpleHTTPServer, we'd need to add Range request support.


