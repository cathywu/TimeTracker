
MINTIME = new Date("Sat May 07 2013 00:00:00");
MAXTIME = new Date("Sat May 07 2013 23:59:59");

RES = []

ALL_DATA = void(0);

function load_data(lines) {
    window.ALL_DATA = [];
    last_title = void(0);
    for (var i in lines) {
        var parts = lines[i];
        var date = new Date(parts[0]);
        var title = parts[1];

        if (title == last_title) {
            window.ALL_DATA[window.ALL_DATA.length - 1][2] += 1
        } else {
            window.ALL_DATA.push([date, title, 1]);
            last_title = title;
        }
    }
}

function binary_search(data, value, keyfn, lean) {
    function searcher(left_idx, right_idx) {
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = keyfn(data[left_idx]);
            var right_key = keyfn(data[right_idx]);

            if (value === left_key) {
                return left_idx;
            } else if (value === right_key) {
                return right_idx;
            } else if (lean === "left" || !lean) {
                return left_idx;
            } else {
                return right_idx;
            }
        } else {
            var midpoint = Math.round((right_idx - left_idx) / 2 + left_idx);
            var midpoint_key = keyfn(data[midpoint]);

            if (value < midpoint_key) {
                return searcher(left_idx, midpoint);
            } else if (value > midpoint_key) {
                return searcher(midpoint, right_idx);
            } else {
                return midpoint;
            }
        }
    }

    return searcher(0, data.length-1);
}

function slice_data(data, start_time, end_time) {
    var s = 1000; // In milliseconds

    var left_idx = binary_search(data, start_time,
                                 function(rec){return rec[0];}, "left");
    var right_idx = binary_search(data, end_time,
                                  function(rec){return rec[0];}, "left");

    // left_idx <= start_time, right_idx <= end_time
    if ((data[left_idx][0] - 0) + data[left_idx][2]*s <= start_time) {
        left_idx += 1;
    }

    if ((data[right_idx][0] - 0) + data[right_idx][2]*s <= start_time) {
        return [];
    }

    var output = data.slice(left_idx, right_idx + 1);
    if (output.length == 0) {
        return output;
    }

    var left = output[0];
    var right = output[output.length - 1];

    if (left[0] < start_time) {
        var extra = Math.round((left[0] - start_time) / s);
        var new_left_start = new Date((left[0] - 0) + extra*s);
        output[0] = [new_left_start, left[1], left[2] - extra];
    }

    if ((right[0] - 0) + right[2]*s > end_time) {
        var extra = Math.round(((right[0] - end_time) + right[2]*s) / s)
        output[output.length - 1] = [right[0], right[1], right[2] - extra];
    }

    return output;
}

function select_blocks(data, res) {
    var blocks = [];
    var total = 0;
    var last_time = 0;

    var s = 1000;

    function push(time, type, number) {
        start_time = time - 0; // Convert Date to *milliseconds* since epoch
        end_time = start_time + number*s

        if (!blocks.length) {
            last_time = end_time;
            blocks.push([number, type, time, void(0)]);
            total += number;
        } else {
            if (start_time - last_time <= 1*s) {
                var last = blocks[blocks.length - 1];
                if (last[1] == type) {
                    last[0] += number;
                    total += number;
                } else {
                    last[3] = start_time;
                    blocks.push([number, type, start_time, void(0)]);
                    total += number;
                }
            } else {
                var skip = Math.round((start_time - last_time) / s);
                blocks[blocks.length - 1][3] = last_time;
                blocks.push([skip, "", last_time, time]);
                blocks.push([number, type, start_time, void(0)]);
                total += skip + number;
            }

            last_time = end_time;
        }
    }
    
    for (var i in data) {
        var date = data[i][0];
        var title = data[i][1];
        var number = data[i][2];

        var found = false;
        for (var j in res) {
            if (title.search(res[j]) > -1) {
                push(date, j, number);
                found = true;
                break;
            }
        }

        if (!found) {
            push(date, "?", number);
        }
    }

    return {blocks: blocks, total: total}
}

function datetime_to_date(datetime) {
    return new Date(datetime.getYear() + 1900, datetime.getMonth(), datetime.getDate());
}

function mapPerDay(start_time, end_time, func) {
    var hour = 1000 * 60 * 60;
    var day = hour * 24;

    var start = (datetime_to_date(start_time) - 0);
    var end = (datetime_to_date(end_time) - 0) + day;

    var out = [];
    for (; start < end - hour; start += day) { // hour is float padding
        out.push(func(new Date(start), new Date(start + day)));
    }
    return out;
}

function display_blocks(output_elt, data, res, blocks, total) {
    output_elt.empty();

    for (var i in blocks) {
        var block = blocks[i];

        var obj = $("<div></div>");
        var name, cssname;
        switch (block[1]) {
            case "":  cssname = "none", name  = ""; break;
            case "?": cssname = name = "unmatched"; break;
            default: cssname = block[1], name  = res[block[1]]; break;
        }
        obj.attr("title", name);
        obj.css("width", (block[0] / total * 100) + "%");
        obj.data("start", block[2]);
        obj.data("end", block[3]);
        obj.on("click", { data: data }, click_block);
        obj.addClass("group-" + cssname);
        output_elt.append(obj);
    }
}

function seconds_to_human_time(sec) {
    function round_one_decimal_place(val) {
        return Math.round(val * 10) / 10;
    }

    if (sec < 60) {
        return sec + "s";
    } else if (sec < 60 * 60) {
        return round_one_decimal_place(sec / 60) + "min";
    } else {
        return round_one_decimal_place(sec / 60) + "hr";
    }
}

function click_block(evt) {
    var start = new Date($(this).data("start"));
    var end = new Date($(this).data("end"));
    var eventlist = slice_data(evt.data.data, start, end);

    $("#blockinfo").empty();
    for (var i in eventlist) {
        var date = eventlist[i][0];
        var title = eventlist[i][1];
        var number = eventlist[i][2];

        var duration = seconds_to_human_time(number);
        var p = $("<p></p>").text(title + " ");
        p.append($("<span></span>").text(duration).addClass("counter"));
        $("#blockinfo").append(p);
    }
}

function draw_timeline(data, res) {
    function draw_blocks(output_elt, data, res) {
        var ret = select_blocks(data, res);
        display_blocks(output_elt, data, res, ret.blocks, ret.total);
    }

    var output_elt = $("<div></div>").addClass("timeline");

    draw_blocks(output_elt, data, res);

    return output_elt;
}

function draw_timelines(data, res) {
    var s = 1000;
    var last_record = data[data.length - 1];
    var start_time = data[0][0];
    var end_time = new Date((last_record[0] - 0) + last_record[2]*s);

    $("#time").empty();
    mapPerDay(start_time, end_time, function(start_day, end_day) {
        var day = slice_data(data, start_day, end_day);
        if (day.length) {
            var elt = draw_timeline(day, res);
        } else {
            var elt = $("<div></div>").addClass("empty-timeline");
        }
        $("#time").append(elt);
    });
}


$(function() {
    draw_timelines(window.ALL_DATA, [/.*/]);

    $("#search-button").click(function() {
        var button = $(this);
        var input = $("#search").val();

        if (!input) {return false;}

        $("#blockinfo").empty();
        $("#search").val("");

        $("#searches").append($("<li></li>").text(input));
        RES.push(new RegExp(input));

        draw_timelines(window.ALL_DATA, RES);
    });
});
