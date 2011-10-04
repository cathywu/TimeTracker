import os
name = "timetracker"
version = "0.1"
image_dir = "/usr/share/pixmaps"
glade_dir = "/usr/share/" + name
data_dir = "/home/cathywu/Dropbox/TimeTracker/data"
data_base = "%(data_dir)s/%(date)s-%(hostname)s.txt" % {'data_dir':data_dir, 'date':'%(date)s', 'hostname':os.uname()[1]}
