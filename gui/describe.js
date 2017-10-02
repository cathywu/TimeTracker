function describe_query(q, $evts) {
    var titles = {};

    q.blocks.forEach(function(block) {
        var eventlist = q.block_to_events(block);
        for (var i = 0; i < eventlist.times.length; i++) {
            var title = eventlist.titles[i];
            if (!titles[title]) titles[title] = 0;
            titles[title] += eventlist.lengths[i];
        }
    });

    var order = Object.keys(titles).sort(function (i, j) {
        return titles[j] - titles[i];
    });

    for (var title of order) {
        var length = titles[title];
        var $evt = $("<tr/>");
        $evt.append($("<td/>").text(Time.Delta.toString(titles[title])).addClass("counter"));
        $evt.append($("<td/>").text(title).addClass("title"));
        $evts.append($evt);
    }
}
