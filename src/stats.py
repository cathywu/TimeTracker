#!/usr/bin/python
import focus_globals as CONFIG
from focus_globals import FILTERS
import fileinput, glob, pickle, pprint, os, re, time

"""
Compute statistics for computer usage and for specific text-based filters

@author cathywu
@created 2011-10-11
"""

# wrapper function to convert ascii string to unicode
def u(string):
    return unicode(string, errors="replace")

def inc_count(dic, val):
    if val in dic:
        dic[val] += 1
    else:
        dic[val] = 1
def get_count(dic, val):
    if val in dic:
        return dic[val]
    else:
        return 0
def inc_count_ls(dic, key, val):
    if key in dic:
        dic[key].append(val)
    else:
        dic[key] = [val]
def get_count_ls(dic, val):
    if val in dic:
        return val[dic]
    else:
        return []
def aggregate_ls(dicts):
    output = {}
    for d in dicts:
        for val in d:
            if val in output:
                output[val].extend(d[val])
            else:
                output[val] = d[val]
    return output
def index(strings):
    ind = {}
    for s in strings:
        for wrd in s.split():
            inc_count_ls(ind, wrd, s)
    return ind
def sortedByPop(dic):
    return sorted(dic, key = lambda x: len(dic[x]), reverse=True)

# start time
starttime = time.time()

# pull all existing log files
os.chdir(CONFIG.data_dir)
files = os.listdir(CONFIG.data_dir)

# load existing data if possible
if os.path.isfile('%s/counts.dump' % CONFIG.stat_dir) and \
    os.path.isfile('%s/indices.dump' % CONFIG.stat_dir):
    counts = pickle.load(open('%s/counts.dump' % CONFIG.stat_dir))
    indices = pickle.load(open('%s/indices.dump' % CONFIG.stat_dir))
else:
    counts = {}
    indices = {}

print "Time to load data: %s" % (time.time()-starttime)

# clear today's data
if time.strftime("%Y-%m-%d") in counts:
    del counts[time.strftime("%Y-%m-%d")]
    del indices[time.strftime("%Y-%m-%d")]

# aggregate data, accounting for multiple machines
for afile in files:
    date = re.match('(?P<date>.{4}-.{2}-.{2})-(?P<device>.*).txt', afile)
    matches = date.groupdict()
    date = matches['date']
    device = matches['device']
    
    if date in counts:
        print "Passing on %s" % afile
        continue

    counts[date] = {}
    print "debug %s" % afile
    indices[date] = index([x.split("=>", 1)[1] for x in fileinput.input(glob.glob("%s-*.txt" % date))])

    for (fname,fpattern) in FILTERS:
        if not fname in counts[date]:
            counts[date][fname] = 0
        for log in fileinput.input(glob.glob("%s-*.txt" % date)):
            if re.search(fpattern,u(log), re.UNICODE):
                counts[date][fname] += 1

print "Time to aggregate data: %s" % (time.time()-starttime)

# save status
pickle.dump(counts, open("%s/counts.dump" % CONFIG.stat_dir, 'w'))
pickle.dump(indices, open("%s/indices.dump" % CONFIG.stat_dir, 'w'))

print "Time to save data: %s" % (time.time()-starttime)

# order the data by date
ordered_counts = sorted(counts.iteritems(),key=lambda date_data: date_data[0])
ordered_indices = sorted(indices.iteritems(),key=lambda date_data: date_data[0])

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

        indices = aggregate_ls([k[1] for k in ordered_indices][-i:])
        print "\n".join([x + " " + str(len(indices[x])/(60*i)) for x in  sortedByPop(indices)[:15]])

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

print "Time to compute averages: %s" % (time.time()-starttime)
