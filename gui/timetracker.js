
MINTIME = new Date("Sat May 07 2013 00:00:00");
MAXTIME = new Date("Sat May 07 2013 23:59:59");

RES = []

function load_data(lines) {
    window.data = [];
    last_title = void(0);
    for (var i in lines) {
        var parts = lines[i];
        var date = new Date(parts[0]);
        var title = parts[1];
        if (title == last_title) {
            window.data[window.data.length - 1][2] += 1
        } else {
            window.data.push([date, title, 1]);
            last_title = title;
        }
    }
}

function select_blocks(res) {
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
            if (start_time - last_time <= 30*s) {
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
    
    for (var i in window.data) {
        var date = window.data[i][0];
        var title = window.data[i][1];
        var number = window.data[i][2];

        if (date < MINTIME || date >= MAXTIME) {
            continue;
        }

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

function display_blocks(res, blocks, total) {
    $("#time").empty();

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
        obj.on("click", click_block);
        obj.addClass("group-" + cssname);
        $("#time").append(obj);
    }
}

function click_block() {
    var start = new Date($(this).data("start"));
    var end = new Date($(this).data("end"));

    $("#blockinfo").empty();
    for (var i in window.data) {
        var date = window.data[i][0];
        var title = window.data[i][1];
        var number = window.data[i][2];

        if (date < start || date >= end) {
            continue;
        }

        var duration = seconds_to_human_time(number);
        var p = $("<p></p>").text(title + " ");
        p.append($("<span>(" + duration + ")</span>").addClass("counter"));
        $("#blockinfo").append(p);
    }
}

function draw_blocks(res) {
    var ret = select_blocks(res);
    display_blocks(res, ret.blocks, ret.total);
}

$(function() {
    draw_blocks([/.*/]);

    $("#search-button").click(function() {
        var button = $(this);
        var input = $("#search").val();

        if (!input) {return false;}

        $("#blockinfo").empty();

        $("#search").val("");
        RES.push(new RegExp(input));
        $("#searches").append($("<li></li>").text(input));
        draw_blocks(RES);
    });
});
