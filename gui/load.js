TIMES   = void(0);
TITLES  = void(0);
LENGTHS = void(0);
ALL = void(0);

PERF = { init: new Date(), request: null, parse: null,
         done: null };

function request_data(url) {
    window.PERF.request = new Date();
    return $.get(url).done(parse_data);
}

function parse_date_ymdhms(date_string, date) {
    var halves = date_string.split(" ");
    var ymd_parts = halves[0].split("-");
    var hms_parts = halves[1].split(":");

    date.setYear(ymd_parts[0]);
    date.setMonth(ymd_parts[1] - 1);
    date.setDate(ymd_parts[2]);

    date.setHours(hms_parts[0]);
    date.setMinutes(hms_parts[1]);
    date.setSeconds(hms_parts[2]);
    date.setMilliseconds(0);

    return date / 1000;
}

function parse_data(data) {
    window.PERF.parse = new Date();
    var lines = data.split("\n");
    var tmp_date = new Date();
    
    window.TIMES = new Array(lines.length);
    window.TITLES = new Array(lines.length);
    window.LENGTHS = new Array(lines.length);

    window.ALL = {times: window.TIMES, titles: window.TITLES,
                  lengths: window.LENGTHS};

    last_title = void(0);
    last_date = void(0);
    var j = 0;
    for (var i in lines) {
        var parts = lines[i].split("\t");
        if (parts.length < 2) continue;
        var date = parse_date_ymdhms(parts.shift(), tmp_date);
        var title = parts.join("\t");

        if (title == last_title && date - last_date <= 10) {
            window.LENGTHS[j - 1] += 1;
        } else {
            window.TIMES[j] = date;
            window.TITLES[j] = title;
            window.LENGTHS[j] = 1;
            j++;
        }

        last_title = title;
        last_date = date;
    }
    window.TIMES.length = j;
    window.TITLES.length = j;
    window.LENGTHS.length = j;

    window.PERF.done = new Date();
}
