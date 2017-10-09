
function TimeMerge() {
    this.logs = []
    for (var i = 0; i < arguments.length; i++) {
        this.logs.push(arguments[i]);
    }
}

TimeMerge.prototype.merge = function(log) {
    this.logs.push(log);
}

TimeMerge.prototype.read_before = function(date) {
    var that = this;
    var promise = new jQuery.Deferred();

    var num = that.logs.length;
    for (var i = 0; i < that.logs.length; i++) {
        that.logs[i].read_before(date).then(function() {
            if (--num) promise.resolveWith(that);
        });
    }

    return promise;
}

TimeMerge.prototype.done = function() {
    var out = true;
    for (var i = 0; i < this.logs.length; i++) {
        out = (out && this.logs[i].done());
    }
    return out;
}

function TimeLog(file_store) {
    this.store = file_store;

    this.times = [];
    this.titles = [];
    this.lengths = [];

    this.start = file_store.size;

    return this;
}

TimeLog.prototype.read_file = function(start_byte, end_byte) {
    var reader = new FileReader();
    var promise = new jQuery.Deferred();
    var t = this;
    reader.onload = function(evt) {
        if (evt.target.readyState == FileReader.DONE) {
            promise.resolveWith(t, [evt.target.result]);
        } else {
            // pass
        }
    }
    reader.readAsText(this.store.slice(start_byte, end_byte), "UTF-8");
    return promise;
}

TimeLog.prototype.find_line = function(start_byte) {
    var promise = new jQuery.Deferred();

    if (start_byte == 0) {
        promise.resolveWith(this, [0]);
        return promise;
    }

    this.read_file(start_byte, start_byte + 128).then(function(buf) {
        var idx = buf.indexOf("\n");

        if (idx >= 0) {
            var ret = start_byte + idx + 1;
            promise.resolveWith(this, [ret]);
        } else {
            this.find_line(start_byte + 128).then(function(ret) {
                promise.resolveWith(this, [ret]);
            });
        }
    });

    return promise;
}

TimeLog.prototype.read_from = function(start_byte) {
    var promise = new jQuery.Deferred();
    this.find_line(start_byte).then(function(start) {
        this.read_file(start, this.start).then(function (data) {
            this.parse_data(data);
            this.start = start;

            promise.resolveWith(this);
        });
    });
    return promise;
}

TimeLog.prototype.parse_data = function(data) {
    var tmp_date = new Date();
    // Fewer Date manipulations
    tmp_date.setDate(1);
    tmp_date.setHours(0);
    tmp_date.setMinutes(0);
    tmp_date.setSeconds(0);
    tmp_date.setMilliseconds(0);

    function parse_date(s) {
        var year = s.substr(0, 4);
        var month = Number(s.substr(5, 2));
        var day = Number(s.substr(8, 2));

        var hour = Number(s.substr(11, 2));
        var minute = Number(s.substr(14, 2));
        var second = Number(s.substr(17, 2));

        // Hand-coding these is a pain because of leap years and month
        // lengths, so we use Date to handle the hard parts
        tmp_date.setFullYear(year);
        tmp_date.setMonth(month-1);

        var offset = 86400*(day-1) + 3600*hour + 60*minute + second;
        return tmp_date / 1000 + offset;
    }
    
    var lines = data.split("\n");
    var n = lines.length;

    var times = new Float64Array(n + this.times.length);
    var titles = new Array();
    var lengths = new Array();

    last_title = void(0);
    last_date = void(0);
    var j = 0;
    for (var i in lines) {
        var parts = lines[i].split("\t");
        if (parts.length < 2) continue;
        var date = parse_date(parts[0]);
        if (date !== date) { continue; } // Skip corrupted lines
        var title = parts[1];

        if (title == last_title && date - last_date <= 10) {
            lengths[j - 1] += 1;
        } else {
            times[j] = date;
            titles[j] = title;
            lengths[j] = 1;
            j++;
        }

        last_title = title;
        last_date = date;
    }
    n = j;

    if (this.titles.length && this.titles[0] == titles[j-1]) {
        this.times[0] = times[j-1];
        this.lengths[0] += lengths[j-1];
        titles.pop(); lengths.pop();

        // Chop off last time.  The extra wasted byte costs nothing
        // since the entire array will be garbage collected if we ever
        // load more data.
        times.set(this.times, n-1);
        this.times = times.subarray(0, n + this.times.length -1);
    } else {
        times.set(this.times, n);
        this.times = times.subarray(0, n + this.times.length);
    }


    this.titles = titles.concat(this.titles);
    this.lengths = lengths.concat(this.lengths);
}

TimeLog.prototype.read_before = function(time) {
    var promise = new jQuery.Deferred();

    var start = this.start - 64*1024;
    if (start <= 0) start = 0;

    this.read_from(start).then(function() {
        {
            var end = this.times[this.times.length-1];
            var cur = this.times[0];

            progress((end - cur) / (end - time));
        }

        if (this.times[0] <= time || start <= 0) {
            promise.resolveWith(this);
        } else {
            this.read_before(time).then(function() {
                promise.resolveWith(this);
            });
        }
    });
    return promise;
}

TimeLog.prototype.done = function() {
    return ! this.start;
}
