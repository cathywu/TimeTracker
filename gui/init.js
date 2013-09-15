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
        return round_one_decimal_place(sec / 60) + "hr";
    } else {
        return Math.round(sec / 60) + "hr";
    }
}

function on_new_search(evt) {
    evt.preventDefault();
    var input = $("#search").val();

    if (!input) {return false;}

    $("#search").val("");

    var cls = "group-" + SELECTORS.length;
    var tile = $("<div/>").addClass(cls);
    var badge = $("<li></li>").text(input).append(tile);

    $("#searches").append(badge);
    SELECTORS.push(new Selectors.RE(input, cls));

    draw_timelines(DATA, SELECTORS);
}

function on_click_block(start, end, eventlist) {
    var $block = $("#blockinfo");
    var $evts = $("#blockevents");

    var head = $block.find("h2").text(timerange_to_string(start, end));

    $evts.empty();
    for (var i = 0; i < eventlist.times.length; i++) {
        var date = eventlist.times[i];
        var title = eventlist.titles[i];
        var number = eventlist.lengths[i];

        var length = seconds_to_human_time(number);
        
        var $evt = $("<tr></tr>");
        $evt.append($("<td></td>").text(length).addClass("counter"));
        $evt.append($("<td></td>").text(title).addClass("title"));
        $evts.append($evt);
    }

    $("#blockinfo").css("display", "block");
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

    $("#search-form").on("submit", on_new_search);
    $("#search-button").click(on_new_search);

    $("#file").on("change", function() {
        $("#getting-started").css("display", "none");
        $("#loading").css("display", "block");
        $("#blockinfo").css("display", "none");

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
});
