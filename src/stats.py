#!/usr/bin/python
import focus_globals as CONFIG
from focus_globals import FILTERS
import pprint, os, re

"""
Compute statistics for computer usage and for specific text-based filters

@author cathywu
@created 2011-10-11
"""

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

# pull all existing log files
os.chdir(CONFIG.data_dir)
files = os.listdir(CONFIG.data_dir)

# aggregate data, accounting for multiple machines
counts = {}
allcounts = {}
indices = {}
for afile in files:
    date = re.match('(?P<date>.{4}-.{2}-.{2}).*', afile)
    date = date.groupdict()['date']
    logs = open(afile)
    indices[date] = index([x.split("=>", 1)[1] for x in logs.readlines()])

    logs = open(afile)
    for log in logs:
        for f in FILTERS:
            if log.find(f) > -1:
                if not date in counts:
                    counts[date] = {f:1}
                elif not f in counts[date]:
                    counts[date][f] = 1
                else:
                    counts[date][f] += 1


# order the data by date
ordered_counts = sorted(counts.iteritems(),key=lambda date_data: date_data[0])
ordered_indices = sorted(indices.iteritems(),key=lambda date_data: date_data[0])

total = []
# average data over different spans of time
for i in [1,3,7,14,28,56,112]:
    if i <= len(ordered_counts):
        print "=== Averages for last %s days (min) ==============================" % i
        days = ordered_counts[-i:-1]
        days.append(ordered_counts[-1])

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
#        pprint.pprint(averages)

