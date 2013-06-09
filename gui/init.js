// Initialization code; global variables and startup code.

RES = []

$(function() {
    request_data("/data.log").done(function() {
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
});
