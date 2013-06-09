ALL_DATA = void(0);

function request_data(url) {
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

    return date - 0;
}

function parse_data(data) {
    var lines = data.split("\n");
    var tmp_date = new Date();
    
    window.ALL_DATA = [];
    last_title = void(0);
    for (var i in lines) {
        var parts = lines[i].split("\t");
        if (parts.length < 2) continue;
        var date = parse_date_ymdhms(parts.shift(), tmp_date);
        var title = parts.join("\t");

        if (title == last_title) {
            window.ALL_DATA[window.ALL_DATA.length - 1][2] += 1
        } else {
            window.ALL_DATA.push([date, title, 1]);
            last_title = title;
        }
    }
}
