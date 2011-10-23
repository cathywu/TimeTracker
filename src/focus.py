#!/usr/bin/python
import time
import thread
import os
import pygtk
import sys
pygtk.require('2.0')

import gtk
import gnome.applet
import gtk.glade
import gnome.ui
import os.path
import re
import gobject
import focus_globals as pglobals

class Focus:
    def __init__(self, applet, iid):
        self.timeout_interval = 1000
        self.timeout_callback = self.write_focused_window 
        gnome.init("focus", "1.0")
        self.applet = applet
        self.tooltips = gtk.Tooltips()
        self.hbox = gtk.HBox()
        applet.add(self.hbox)

        self.ev_box = gtk.EventBox()
        self.ev_box.connect("button-press-event", self.button_press)
        self.ev_box.connect("enter-notify-event", self.update_info)
        self.hbox.add(self.ev_box)
        self.prog = gtk.ProgressBar()
        self.ev_box.add(self.prog)
        gtk.timeout_add(self.timeout_interval, self.timeout_callback, self)
        applet.connect("destroy", self.cleanup)
        applet.show_all()
    def update_info(self, widget, event):
        self.tooltips.set_tip(self.ev_box, "test")
    def button_press(self, widget, event):
        if event.type == gtk.gdk.BUTTON_PRESS and event.button == 3:
            self.create_menu()
    def cleanup(self, event):
        pass
    def about_info(self,event,data=None):
        about = gnome.ui.About("Time Wastage Tracker","0.1","GPL","Monitor where you're wasting your time",["Pranjal Vachaspati"],["Pranjal Vachaspati"],"Pranjal Vachaspati",self.logo_pixbuf)
        about.show()
        
    def properties(self,event,data=None):
        self.preferences.show()

    def get_idle_time_ms(self):
        inp = os.popen("xprintidle")
        return int(inp.readline())
        
    def write_focused_window(self, event):
        if self.get_idle_time_ms() > 30000:
            return gtk.TRUE
        inp = os.popen("xdotool getwindowfocus | xargs xprop _NET_WM_NAME -id")
        result = re.match('_NET_WM_NAME\(UTF8_STRING\) = "(?P<window_name>.*)"', inp.readline())

        # skip queries that don't match regex
        # FIXME figure out why they don't match
        if not result:
            return gtk.TRUE
        nm = result.groupdict()['window_name']
        if not nm:
            return gtk.TRUE
        nm = result.groupdict()['window_name']
        tm = time.localtime()
        f = open(self.get_filename(tm), "a")
        tofday = time.strftime("%H:%M:%S", tm)
        f.write(tofday + " => " + nm + "\n")
        f.close()
        return gtk.TRUE
    
    def get_filename(self, t):
        return pglobals.data_base % {'date': time.strftime("%Y-%m-%d", t)}
        
def focus_factory(applet, iid):
    Focus(applet, iid)
    return gtk.TRUE

#gnome.applet.bonobo_factory("OAFIID:GNOME_FocusApplet_Factory",
#                            gnome.applet.Applet.__gtype__,
#                            "help", "0", focus_factory)

def FocusApplet(applet, iid):
    def __init__(self, base):
        gtk.Widget.__init__(self)
        self.base = base
        


app = gnome.applet.Applet()
focus_factory(app, None)

gtk.main()
sys.exit()
    




