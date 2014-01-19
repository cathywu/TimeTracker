Time = {Delta: {}, Range: {}, Unit: {}};

Time.Delta.toString = function(sec) {
    function round_one_decimal_place(val) {
        return Math.round(val * 10) / 10;
    }

    if (sec < 60) {
        return sec + "s";
    } else if (sec < 60 * 10) {
        return round_one_decimal_place(sec / 60) + "m";
    } else if (sec < 60 * 60) {
        return Math.round(sec / 60) + "m";
    } else if (sec < 60 * 60 * 10) {
        return round_one_decimal_place(sec / (60 * 60)) + "hr";
    } else {
        return Math.round(sec / (60 * 60)) + "hr";
    }
}

Time.Delta.toUnit = function(sec, n) {
    n = n || 1;

    if (sec < 60*n) {
        return "s";
    } else if (sec < 60*60*n) {
        return "m";
    } else {
        return "h";
    }
}

Time.unit = function(n, u) {
    if (u == "s") {
        return n;
    } else if (u == "m") {
        return 60 * n;
    } else if (u == "h") {
        return 60 * 60 * n;
    }
}

Time.Range.toString = function(start, end) {
    start = moment.unix(start);
    end = moment.unix(end);
    var title = start.format("[On] ll");
    if (end.diff(start) < 2*60*1000) {
        title += start.format(", [at] HH:mm [for] ") + end.from(start, true);
    } else {
        title += start.format(", [at] HH:mm–") + end.format("HH:mm");
    }
    return title;
}
