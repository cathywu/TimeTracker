// Functions to display the timelines

function display_blocks(output_elt, data, res, blocks, total) {
    output_elt.empty();

    var check_total = 0;

    for (var i in blocks) {
        var block = blocks[i];

        check_total += block[0];

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

    if (total != check_total) {
        console.log("Error in checking total:", total, check_total);
        window.ERROR = {data: data, total: total, blocks: blocks, check: total};
    }
}

function click_block(evt) {
    var start = $(this).data("start");
    var end = $(this).data("end");
    var eventlist = slice_data(evt.data.data, start, end);

    on_click_block(moment.unix(start), moment.unix(end), eventlist);
}

function draw_timeline(data, start_day, end_day, res) {
    function draw_blocks(output_elt, data, res) {
        var ret = select_blocks(data, res);
        var padding = pad_blocks_day(ret.blocks, start_day, end_day);
        display_blocks(output_elt, data, res, ret.blocks, ret.total + padding);
    }

    var output_elt = $("<div></div>").addClass("timeline");

    draw_blocks(output_elt, data, res);

    return output_elt;
}

function draw_timelines(data, res) {
    var start_time = data.times[0];
    var last = data.times.length - 1;
    var end_time = data.times[last] + data.lengths[last];

    $("#time").empty();
    var last_dots = false;
    mapPerDay(start_time, end_time, function(start_day, end_day) {
        var day = slice_data(data, start_day, end_day);

        if (day.times.length) {
            var elt = draw_timeline(day, start_day, end_day, res);
            last_dots = false;
            $("#time").append(elt);
        } else if (!last_dots) {
            var elt = $("<div></div>").addClass("empty-timeline");
            elt.text("1 day skipped");
            elt.data("days-skipped", 1);
            last_dots = elt;
            $("#time").append(elt);
        } else {
            var skipped = last_dots.data("days-skipped");
            last_dots.data("days-skipped", ++skipped);
            last_dots.text(skipped + " days skipped");
        }
    });
}

function mapPerDay(start_time, end_time, func) {
    var start = moment.unix(start_time).startOf("day");
    var end = moment.unix(end_time).startOf("day").add("day", 1);
    var days = end.diff(start, "days");
    end = start.clone().add("day", 1);

    var out = [];
    for (var i = 0; i < days; i++, start.add("d", 1), end.add('d', 1)) {
        out.push(func(start/1000, end/1000));
    }
    return out;
}
