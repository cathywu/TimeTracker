// Initialization code; global variables and startup code.

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
