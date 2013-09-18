// Initialization code; global variables and startup code.

SELECTORS = []
DATA = null;
START = null;

function timerange_to_string(start, end) {
    var title = start.format("[On] ll");
    if (end.diff(start) < 2*60*1000) {
        title += start.format(", [at] HH:mm [for] ") + end.from(start, true);
    } else {
        title += start.format(", [at] HH:mm–") + end.format("HH:mm");
    }
    return title;
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
        return round_one_decimal_place(sec / (60 * 60)) + "hr";
    } else {
        return Math.round(sec / (60 * 60)) + "hr";
    }
}

function on_new_search(evt) {
    evt.preventDefault();
    var input = $("#search").val();

    if (!input) {return false;}

    $("#search").val("");

    var cls = "group-" + SELECTORS.length;
    var selector = parse_query(input, cls);
    var tile = $("<div/>").addClass(cls);
    var badge = $("<li></li>").text(input).append(tile);
    badge.on("click", { data: DATA }, function(evt) {
        on_click_search(selector, evt);
    });

    $("#searches").append(badge);
    SELECTORS.splice(0, 0, selector);

    selector.group = cls;
    selector.badge = badge;

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "none");
    draw_timelines(DATA, SELECTORS);
}

function on_click_block(start, end, eventlist) {
    var $block = $("#blockinfo");
    var $evts = $("#blockevents");

    var head = $block.find("h2").text(timerange_to_string(start, end));

    $evts.empty();
    add_events(eventlist, $evts);

    $("#searchinfo").css("display", "none");
    $("#blockinfo").css("display", "block");
}

function on_click_search(selector, evt) {
    var $block = $("#searchinfo");
    $block.data("selector", selector);

    $block.find("h2").text(selector.text);
    var $evts = $block.find("#searchevents");
    $evts.empty();

    // TODO : Dumb
    var total_secs = 0;
    var total_blocks = 0;
    $(".timeline > ." + selector.group).each(function(block) {
        var start = $(this).data("start");
        var end = $(this).data("end");
        var eventlist = slice_data(evt.data.data, start, end);

        var block_secs = 0;
        for (var seg_secs of eventlist.lengths) block_secs += seg_secs;

        var $counter = $("<td/>").addClass("counter");
        $counter.text(seconds_to_human_time(block_secs));
        var $text = $("<td/>").addClass("title");
        $text.text("Looking at " + selector.text);
        var $expand = $("<td/>").addClass("action");
        var $row = $("<tr/>").append($counter).append($text).append($expand);
        $evts.append($row);

        var $link = $("<a/>").attr("href", "#").text("details");
        $expand.append($link);

        var ctr = true;
        $link.click(function(evt) {
            if (ctr) {
                var $table = $("<table/>");
                var $cell = $("<td/>").append($table).attr("colspan", 3);
                $row.after($("<tr/>").append($cell));
                add_events(eventlist, $table);
                $link.text("close");
            } else {
                $row.next("tr").remove();
                $link.text("details");
            }

            ctr = !ctr;
            evt.preventDefault();
        });

        total_secs += block_secs;
        total_blocks += 1;
    });

    $block.find("#searchdetails .total_time").text(seconds_to_human_time(total_secs));
    $block.find("#searchdetails .total_blocks").text(total_blocks);

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "block");
}

function load_before(date) {
    START = date;
    return DATA.read_before(date).then(function() {
        $("#loading").css("display", "none");
        $("#ui").css("display", "block");

        draw_timelines(slice_data(DATA, date, moment()/1000), SELECTORS);
        if (! DATA.start) {
            $("#load-more").hide();
        }
    });
}

$(function() {
    $("#file-button").on("click", function() {
        $("#file")[0].click();
    });

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "none");

    $("#search-form").on("submit", on_new_search);
    $("#search-button").click(on_new_search);

    $("#file").on("change", function() {
        $("#getting-started").css("display", "none");
        $("#loading").css("display", "block");
        $("#blockinfo").css("display", "none");
        $("#searchinfo").css("display", "none");

        var load_updater = setInterval(function() {
            $("#loading > div > div").width((PROGRESS * 100) + "%");
        }, 25);

        var file = this.files[0];
        if (!file) return;

        DATA = new TimeLog(file);
        
        // The past one week of data
        var start = (moment().subtract('week', 1).endOf('day') + 1)/1000;
        load_before(start).then(function() {
            clearInterval(load_updater);
        });
    });
    
    $("#load-more").on("click", function(evt) {
        $("#load-more").addClass("loading").attr("disabled", "disabled");
        var start = moment.unix(START).subtract('week', 1) / 1000;
        load_before(start).then(function() {
            $("#load-more").removeClass("loading").removeAttr("disabled");
        });
    });

    $("#delete-search").on("click", function() {
        var sel = $("#searchinfo").data("selector");
        var idx = SELECTORS.indexOf(sel);
        if (idx == -1) return;
        SELECTORS.splice(idx, 1);
        sel.badge.remove();
        draw_timelines(DATA, SELECTORS);
        $("#searchinfo").css("display", "none");
    });
});
