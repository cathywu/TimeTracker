import os
name = "timetracker"
version = "0.1"
image_dir = "/usr/share/pixmaps"
glade_dir = "/usr/share/" + name
data_dir = "%s/Dropbox/TimeTracker/data" % os.environ['HOME']
data_base = "%(data_dir)s/%(date)s-%(hostname)s.txt" % {'data_dir':data_dir, 'date':'%(date)s', 'hostname':os.uname()[1]}

# '' for general computer usage
# CAUTION: filters should be carefully selected to be fairly unique identifiers
FILTERS = ['', 'Gmail', 'Google Calendar', 'Grooveshark', 'Google Search',
           'Facebook', 'maslab-2011-8@maslab-2011-8', 'cathywu@bohnanza',
           'Hacker News', 'f | ']
