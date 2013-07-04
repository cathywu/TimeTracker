// Initialization code; global variables and startup code.

RES = []
DATA = null;

function on_new_search() {
    var button = $(this);
    var input = $("#search").val();

    if (!input) {return false;}

    $("#search").val("");

    var cls = "group-" + RES.length;
    var tile = $("<img/>").addClass(cls);
    var badge = $("<li></li>").text(input).append(tile);

    $("#searches").append(badge);
    RES.push(new RegExp(input));

    draw_timelines(DATA, RES);
}

function on_click_block(start, end, eventlist) {
    var $block = $("#blockinfo");
    var $evts = $("#blockevents");

    var head = $block.find("h2").text(print_timerange(start, end));

    $evts.empty();
    for (var i in eventlist.times) {
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

$(function() {
    $("#file-button").on("click", function() {
        $("#file")[0].click();
    });

    $("#blockinfo").css("display", "none");

    $("#search_form").on("submit", function(evt) {
        evt.preventDefault();
        on_new_search();
    });

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
        var start = datetime_next_day(Date.now() / 1000 - 60 * 60 * 24 * 7);
        DATA.read_before(start).then(function() {
            $("#loading").css("display", "none");
            $("#ui").css("display", "block");
            clearInterval(load_updater);

            draw_timelines(DATA, []);

            $("#search-button").click(on_new_search);
        });
    });
});
