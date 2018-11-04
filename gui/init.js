// Initialization code; global variables and startup code.

QUERIES = []
DATA = null;
START = null;
CDATA = null;

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

    redraw();
}

function redraw() {
    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "none");
    $("#time .timeline, #time .empty-timeline").remove();
    for (var q of QUERIES) q.reset();
    draw_timelines(CDATA, QUERIES);
}

function on_click_block(start, end, eventlist) {
    var $block = $("#blockinfo");
    var $evts = $("#blockevents");

    var head = $block.find("h2").text(Time.Range.toString(start / 1000, end / 1000));

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
        var idx = QUERIES.indexOf(q);
        if (idx == -1) return;

        var q2 = new Query($(this).val(), q.data);
        q2.selector.group = q.selector.group;
        q2.selector.badge = q.selector.badge;
        var $colorblock = q.selector.badge.find("div");
        q.selector.badge.text(q.text).append($colorblock);
        QUERIES[idx] = q2;
        $("#searchinfo").data("query", q2);
        q.selector.badge.data("query", q2);

        redraw()
        q.selector.badge.click();
    });

    var $evts = $block.find("#searchevents");
    $evts.empty();

    describe_query(q, $evts);
    /*
    q.blocks.forEach(function(block) {
        var eventlist = q.block_to_events(block);

        var $counter = $("<td/>").addClass("counter");
        $counter.text(Time.Delta.toString(block.length));
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
    */

    $block.find("#searchdetails .total_time").text(Time.Delta.toString(q.total));
    $block.find("#searchdetails .total_blocks").text(q.blocks.length);

    // Draw the histogram
    var cvs = $block.find("#searchdetails .search_histogram")[0];
    var ctx = cvs.getContext("2d");
    cvs.width = cvs.width;

    var max = 0;
    for (var i = 0; i < 24; i++) {
        max = Math.max(q.hist[i], max);
    }

    // Draw guidelines
    var maxs = max * 3600;
    var unit = Time.Delta.toUnit(maxs, 4);
    var ucnt = Time.unit(Math.round(maxs / Time.unit(4, unit)), unit);
    var hgt = ucnt / maxs * 80;
    ctx.strokeStyle = "#aaa";
    ctx.beginPath();
    for (var i = 1; i*hgt < 90; i++) {
        ctx.moveTo(35, Math.round(100 - hgt*i) + .5);
        ctx.lineTo(1000, Math.round(100 - hgt*i) + .5);
        ctx.fillText(Time.Delta.toString(ucnt * i), 6,
                     Math.round(100 - hgt*i + 5) + .5, 25);
    }
    ctx.stroke();

    ctx.textAlign = "center";
    for (var i = 0; i < 24; i++) {
        var y = 100 - q.hist[i] / max * 80;
        ctx.fillStyle = "#bbb";
        ctx.fillRect(40*i + 41, y, 39, q.hist[i] / max * 80);
        ctx.fillStyle = "#888";
        ctx.fillText((i < 10 ? "0" : "") + i + ":00", 40*i + 60, 98);
    }

    $("#blockinfo").css("display", "none");
    $("#searchinfo").css("display", "block");
}

function load_before(date) {
    var end = START;
    START = date;
    return DATA.read_before(date).then(function() {
        CDATA = DATA.slice(date, moment()/1000);

        $("#loading").css("display", "none");
        $("#ui").css("display", "block");

        draw_timelines(CDATA.slice(date, end), QUERIES);
        if (DATA.done()) {
            $("#load-more").hide();
        }
    });
}

function add_file() {
    var file = this.files[0];
    if (!file) return;

    var data2 = new TimeLog(file);
    if (DATA instanceof TimeMerge) {
        DATA.merge(data2);
    } else {
        DATA = new TimeMerge(DATA, data2);
    }

    DATA.read_before(START).then(function() {
        CDATA = DATA.slice(START, moment()/1000);
        redraw();
    });
}

$(function() {
    $("#file-button").on("click", function() {
        $("#file")[0].click();
    });

    $("#add-file-button").on("click", function() {
        $(this).siblings("input[type=file]").click();
    });

    $("#add-file").on("change", add_file);

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
        $("#time .timeline, #time .empty-timeline").remove();
        draw_timelines(CDATA, QUERIES);
        $("#searchinfo").css("display", "none");
        $("#blockinfo").css("display", "none");
    });
});
