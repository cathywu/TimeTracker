import os
name = "timetracker"
version = "0.1"
image_dir = "/usr/share/pixmaps"
glade_dir = "/usr/share/" + name
data_dir = "%s/Dropbox/TimeTracker/data" % os.environ['HOME']
data_base = "%(data_dir)s/%(date)s-%(hostname)s.txt" % {'data_dir':data_dir, 'date':'%(date)s', 'hostname':os.uname()[1]}

stat_dir = "%s/Dropbox/TimeTracker/stat" % os.environ['HOME']

# '' for general computer usage
# CAUTION: filters should be carefully selected to be fairly unique identifiers
FILTERS = [('Computer Usage', ''), 
           ('Email', u'Gmail| says\ufffd\ufffd\ufffd'),
           ('Calendar', 'Google Calendar'), 
           ('Music', 'Grooveshark'),
           ('Google Search', 'Google Search'),
           ('Facebook', 'Facebook'),
           ('Terminal', 'maslab-2011-8@maslab-2011-8|cathywu@bohnanza'),
           ('Hacker News', 'Hacker News'),
           ('Feedly', 'f \| '),
           ('Anki', 'Anki'),
           ('Stack Overflow', 'Stack Overflow'),
           ('TED', 'on TED\.com|TED:'),
           ('Mundane', 'TODO'),
           ('Wikipedia', 'Wikipedia, the free encyclopedia')]
