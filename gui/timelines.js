// Functions to display the timelines

function display_blocks(output_elt, data, res, blocks, total) {
    var check_total = 0;

    for (var i in blocks) {
        var block = blocks[i];

        check_total += block[0];

        var obj = $("<div></div>");
        var name, cssname;
        switch (block[1]) {
            case "":  cssname = "group-none", name  = ""; break;
            case "?": cssname = "group-unmatched", name = "unmatched"; break;
            default: cssname = block[1], name  = res[block[1]]; break;
        }
        obj.attr("title", name);
        obj.css("width", (block[0] / total * 100) + "%");
        obj.data("start", block[2]);
        obj.data("end", block[3]);
        obj.on("click", { data: data }, click_block);
        obj.addClass(cssname);

        if (cssname == "group-none" && block[0] / total > .01) {
            output_elt.find("div").last().addClass("round-right");
        } else if (cssname != "none") {
            var last = output_elt.find("div").last();
            if (last.hasClass("group-none") &&
                +last.css("width").split("%")[0] > 1) { // strip("%")
                obj.addClass("round-left");
            }
        }
        
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
    var eventlist = evt.data.data.slice(start, end);

    on_click_block(moment.unix(start), moment.unix(end), eventlist);
}

FORMATS = {
    "day": "MMM Do",
    "hour": "H:mm",
}

FINER = {
    "day": "hour"
}

function click_label(evt) {
    var crumb = {
        start: $(this).data("start"),
        end: $(this).data("end"),
        step: FINER[$(this).data("step")],
    }
    crumb.name = moment(crumb.start * 1000).format(FORMATS[$(this).data("step")]);
    CRUMBS.push(crumb);
    goto_crumb(crumb);
}

function draw_timeline(data, start_day, end_day, res, step) {
    function draw_blocks(output_elt, data, res) {
        var ret = select_blocks(data, res);
        var padding = pad_blocks_day(ret.blocks, start_day, end_day);
        display_blocks(output_elt, data, res, ret.blocks, ret.total + padding);
    }

    var output_elt = $("<div></div>").addClass("timeline");
    var label = $("<time></time>").text(moment.unix(start_day).format(FORMATS[step]));
    label.data("start", start_day);
    label.data("end", end_day);
    if (FINER[step]) {
        label.data("step", step);
        label.addClass("clickable");
        label.on("click", click_label);
    }
    output_elt.prepend(label);

    draw_blocks(output_elt, data, res);

    return output_elt;
}

function draw_timelines(data, res, step) {
    step = step || "day";
    var start_time = data.start;
    var end_time = data.end;

    var top_timeline = $("#time").children().first();
    var last_dots = top_timeline.hasClass("empty-timeline") ? top_timeline : false;
    mapPer(step, start_time, end_time, function(start_day, end_day) {
        var day = data.slice(start_day, end_day);

        if (day.times.length) {
            var elt = draw_timeline(day, start_day, end_day, res, step);
            last_dots = false;
            $("#time").prepend(elt);
        } else if (!last_dots) {
            var elt = $("<div></div>").addClass("empty-timeline");
            elt.text("1 " + step + " skipped");
            elt.data("skipped", 1);
            last_dots = elt;
            $("#time").prepend(elt);
        } else {
            var skipped = last_dots.data("skipped");
            last_dots.data("skipped", ++skipped);
            last_dots.text(skipped + " " + step + "s skipped");
        }
    });
}

function mapPer(step, start_time, end_time, func) {
    var start = moment.unix(start_time).startOf(step);
    var end = moment.unix(end_time).subtract("ms", 1).startOf(step).add(step, 1);
    var days = end.diff(start, step + "s");
    start = end.clone().subtract(step, 1);

    var out = [];
    for (var i = 0; i < days; i++, start.subtract(step, 1), end.subtract(step, 1)) {
        out.push(func(start/1000, end/1000));
    }
    return out;
}
