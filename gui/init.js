// Initialization code; global variables and startup code.

RES = []
DATA = null;

$(function() {
    $("#file-button").on("click", function() {
        $("#file")[0].click();
    });

    $("#file").on("change", function() {
        $("#getting-started").css("display", "none");
        $("#loading").css("display", "block");

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
