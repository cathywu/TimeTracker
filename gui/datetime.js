
function parse_date_ymdhms(date_string, date) {
    if (!date) date = new Date();

    var halves = date_string.split(" ");
    var ymd_parts = halves[0].split("-");
    var hms_parts = halves[1].split(":");

    date.setUTCFullYear(ymd_parts[0]);
    date.setUTCMonth(ymd_parts[1] - 1);
    date.setUTCDate(ymd_parts[2]);

    date.setUTCHours(hms_parts[0]);
    date.setUTCMinutes(hms_parts[1]);
    date.setUTCSeconds(hms_parts[2]);
    date.setUTCMilliseconds(0);

    return date / 1000;
}

function flt_to_date(date_flt) {
    var date = new Date();
    // Correct for timezone issues
    date_flt += date.getTimezoneOffset() * 60;
    return new Date(date_flt * 1000);
}

function seconds_to_human_time(sec) {
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
        return round_one_decimal_place(sec / 60) + "hr";
    } else {
        return Math.round(sec / 60) + "hr";
    }
}

function print_date(start) {
    var days_of_week = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
    var months_of_year = "Jan,Feb,Mar,Apr,May,June,July,Aug,Sept,Oct,Nov,Dec".split(",");
    var sdate = flt_to_date(start);
    var now = new Date();
    var day = sdate.getDay() + 1; // Javascript Date is idiosynchratic

    if (now.getYear() != sdate.getYear()) {
        // "29 Apr 2013" looks better than "Apr 29, 2013", ...
        var day = day + " " + months_of_year[sdate.getMonth()];
        return day + " " + sdate.getYear();
    } else {
        // ... but "4 July" looks worse than "July 4"
        return months_of_year[sdate.getMonth()] + " " + day;
    }
}

function print_time(start) {
    var sdate = flt_to_date(start);

    // Minutes are always padded to two digits
    var padded_minutes = "0" + sdate.getMinutes();
    var minutes = padded_minutes.substr(padded_minutes.length - 2);

    // Hours are not padded (2:12 is a fine date), but times just past
    // midnight are formatted as "00:12" instead of as "0:12".
    var hours = sdate.getHours() ? sdate.getHours() : "00";

    return hours + ":" + minutes;
}

function print_timerange(start, end) {
    var sdate = flt_to_date(start);
    var delta = end - start;

    var str = "On " + print_date(start) + ",";
    if (delta < 2*60) {
        str += " at " + print_time(start);
        str += " for " + seconds_to_human_time(delta);
    } else {
        str += " for " + print_time(start);
        str += "–" + print_time(end);
    }

    return str;
}
