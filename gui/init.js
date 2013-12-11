// Initialization code; global variables and startup code.

QUERIES = []
DATA = null;
START = 1e50;
CDATA = null;

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

    var cls = "group-" + QUERIES.length;
    var q = new Query(input, CDATA);

    var tile = $("<div/>").addClass(cls);
    var badge = $("<li></li>").text(input).append(tile);
    badge.data("query", q);
    badge.on("click", { data: CDATA }, function(evt) {
        on_click_search(badge.data("query"), evt);
    });

    $("#searches").append(badge);
    QUERIES.splice(0, 0, q);

    q.selector.group = cls;
    q.selector.badge = badge;

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "none");
    $("#time .timeline, #time .empty-timeline").remove();
    for (var q of QUERIES) q.reset();
    draw_timelines(CDATA, QUERIES);
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

function on_click_search(q, evt) {
    var $block = $("#searchinfo");
    $block.data("query", q);

    $block.find("#search-text").val(q.text);
    $block.find("#search-text").change(function() {
        var q = $("#searchinfo").data("query");
        var idx = QUERIES.indexOf(sel);
        if (idx == -1) return;

        var q2 = new Query($(this).val());
        q2.selector.group = q.selector.group;
        q2.selector.badge = q.selector.badge;
        var $colorblock = q.selector.badge.find("div");
        q.selector.badge.text(q.text).append($colorblock);
        QUERIES[idx] = q2;
        $("#searchinfo").data("query", q2);
        q.selector.badge.data("query", q2);

        draw_timelines(CDATA, QUERIES);
        $("#blockinfo").css("display", "none");
        q.selector.badge.click();
    });

    var $evts = $block.find("#searchevents");
    $evts.empty();

    // TODO : Dumb
    q.blocks.forEach(function(block) {
        var eventlist = q.block_to_events(block);

        var $counter = $("<td/>").addClass("counter");
        $counter.text(seconds_to_human_time(block.length));
        var $text = $("<td/>").addClass("title");
        $text.text("Looking at " + q.text);
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
    });

    $block.find("#searchdetails .total_time").text(seconds_to_human_time(q.total));
    $block.find("#searchdetails .total_blocks").text(q.blocks.length);

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "block");
}

function load_before(date) {
    var end = START;
    START = date;
    return DATA.read_before(date).then(function() {
        CDATA = slice_data(DATA, date, moment()/1000);

        $("#loading").css("display", "none");
        $("#ui").css("display", "block");

        draw_timelines(slice_data(CDATA, date, end), QUERIES);
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
    $("#search-button").on("click", on_new_search);

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

    $("#load-more").removeAttr("disabled");
    $("#load-more").on("click", function(evt) {
        $("#load-more").addClass("loading").attr("disabled", "disabled");
        var start = moment.unix(START).subtract('week', 1) / 1000;
        load_before(start).then(function() {
            $("#load-more").removeClass("loading").removeAttr("disabled");
        });
    });

    $("#delete-search").on("click", function() {
        var q = $("#searchinfo").data("query");
        var idx = QUERIES.indexOf(q);
        if (idx == -1) return;
        QUERIES.splice(idx, 1);
        q.selector.badge.remove();
        draw_timelines(CDATA, QUERIES);
        $("#searchinfo").css("display", "none");
        $("#blockinfo").css("display", "none");
    });
});
