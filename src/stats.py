#!/usr/bin/python
import focus_globals as CONFIG
from focus_globals import FILTERS
import pickle, pprint, os, re, time

"""
Compute statistics for computer usage and for specific text-based filters

@author cathywu
@created 2011-10-11
"""

# wrapper function to convert ascii string to unicode
def u(string):
    return unicode(string, errors="replace")

starttime = time.time()

# pull all existing log files
os.chdir(CONFIG.data_dir)
files = os.listdir(CONFIG.data_dir)

# load existing data if possible
if os.path.isfile('%s/counts.dump' % CONFIG.stat_dir) and \
    os.path.isfile('%s/status.dump' % CONFIG.stat_dir):
    counts = pickle.load(open('%s/counts.dump' % CONFIG.stat_dir))
    status = pickle.load(open('%s/status.dump' % CONFIG.stat_dir))
else:
    counts = {}
    status = {}

# clear today's data
if time.strftime("%Y-%m-%d") in counts:
    del counts[time.strftime("%Y-%m-%d")]
    del status[time.strftime("%Y-%m-%d")]

# aggregate data, accounting for multiple machines
for afile in files:
    date = re.match('(?P<date>.{4}-.{2}-.{2})-(?P<device>.*).txt', afile)
    matches = date.groupdict()
    date = matches['date']
    device = matches['device']
    if not date in counts:
        counts[date] = {}
        status[date] = {}
    for (fname,fpattern) in FILTERS:
        if not fname in counts[date]:
            counts[date][fname] = 0
            status[date][fname] = {}
        if not device in status[date][fname]:
            logs = open(afile)
            for log in logs:
                if re.search(fpattern,u(log), re.UNICODE):
                    counts[date][fname] += 1
        status[date][fname][device] = 1

# save status
pickle.dump(counts, open("%s/counts.dump" % CONFIG.stat_dir, 'w'))
pickle.dump(status, open("%s/status.dump" % CONFIG.stat_dir, 'w'))

# order the data by date
ordered_counts = sorted(counts.iteritems(),key=lambda date_data: date_data[0])

total = []
# todays data
print "=== So far today (min) =========================================="
days = [ordered_counts[-1]]
totals = {}
averages = {}
for day in days:
    for key in day[1]:
        if key not in totals:
            totals[key] = day[1][key]
        else:
            totals[key] += day[1][key]
for key in totals:
    totals[key] = totals[key]/60
pprint.pprint(totals)
# average data over different spans of time
for i in [1,3,7,14,28,56,112]:
    if (i-1) <= len(ordered_counts):
        print "=== Averages for last %s days (min) ==============================" % i
        days = ordered_counts[-i-1:-1]
        totals = {}
        averages = {}
        for day in days:
            for key in day[1]:
                if key not in totals:
                    totals[key] = day[1][key]
                else:
                    totals[key] += day[1][key]
        for key in totals:
            totals[key] = totals[key]/60
            averages[key] = totals[key]/i
        pprint.pprint(averages)

print "Computation time: %s" % (time.time()-starttime)
