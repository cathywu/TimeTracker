
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
