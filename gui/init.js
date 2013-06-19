// Initialization code; global variables and startup code.

RES = []
DATA = null;

$(function() {
    $("#file").on("change", function() {
        var file = this.files[0];
        if (!file) return;

        DATA = new TimeLog(file);

        // The past one week of data
        var start = datetime_next_day(Date.now() / 1000 - 60 * 60 * 24 * 7);
        DATA.read_before(start).then(function() {
            draw_timelines(DATA, []);

            $("#search-button").click(function() {
                var button = $(this);
                var input = $("#search").val();

                if (!input) {return false;}

                $("#blockinfo").empty();
                $("#search").val("");

                $("#searches").append($("<li></li>").text(input));
                RES.push(new RegExp(input));

                draw_timelines(DATA, RES);
            });
        });
    });
});
