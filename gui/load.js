
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
            console.log("Ready state is", evt.target.readyState);
        }
    }
    reader.readAsText(this.store.slice(start_byte, end_byte), "UTF-8");
    return promise;
}

TimeLog.prototype.find_line = function(start_byte) {
    var promise = new jQuery.Deferred();

    this.read_file(start_byte, start_byte + 128) .then(function(buf) {
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
    function parse_date(date_string) {
        var halves = date_string.split(" ");
        var ymd_parts = halves[0].split("-");
        var hms_parts = halves[1].split(":");
        
        tmp_date.setFullYear(ymd_parts[0]);
        tmp_date.setMonth(ymd_parts[1] - 1);
        tmp_date.setDate(ymd_parts[2]);

        tmp_date.setHours(hms_parts[0]);
        tmp_date.setMinutes(hms_parts[1]);
        tmp_date.setSeconds(hms_parts[2]);
        tmp_date.setMilliseconds(0);

        return tmp_date / 1000;
    }
    
    var lines = data.split("\n");

    var times = new Array();
    var titles = new Array();
    var lengths = new Array();

    last_title = void(0);
    last_date = void(0);
    var j = 0;
    for (var i in lines) {
        var parts = lines[i].split("\t");
        if (parts.length < 2) continue;
        var date = parse_date(parts[0]);
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

    if (this.titles.length && this.titles[0] == titles[j-1]) {
        this.times[0] = times[j-1];
        this.lengths[0] += lengths[j-1];
        times.pop(); titles.pop(); lengths.pop();
    }

    this.times = times.concat(this.times);
    this.titles = titles.concat(this.titles);
    this.lengths = lengths.concat(this.lengths);
}

TimeLog.prototype.read_before = function(time) {
    var promise = new jQuery.Deferred();
    this.read_from(this.start - 64*1024).then(function() {

        {
            var end = this.times[this.times.length-1];
            var cur = this.times[0];
            var start = time;

            progress((end - cur) / (end - start));
        }

        if (this.times[0] <= time) {
            promise.resolveWith(this);
        } else {
            this.read_before(time).then(function() {
                promise.resolveWith(this);
            });
        }
    });
    return promise;
}
