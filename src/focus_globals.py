import os
name = "timetracker"
version = "0.1"
image_dir = "/usr/share/pixmaps"
glade_dir = "/usr/share/" + name
data_dir = "/home/pranjal/Dropbox/log/timetracker/"
data_base = "%(data_dir)s/%(date)s-%(hostname)s.txt" % {'data_dir':data_dir, 'date':'%(date)s', 'hostname':os.uname()[1]}

# '' for general computer usage
# CAUTION: filters should be carefully selected to be fairly unique identifiers
FILTERS = ['', 'Gmail', 'Google Calendar', 'Grooveshark', 'Google Search',
           'Facebook', 'pranjal@aristotle', 'reddit.com', 'Chromium',
           'Hacker News', 'f | ', 'Turn', 'turn']
