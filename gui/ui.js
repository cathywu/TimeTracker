// Captures some common UI patterns

function add_events(eventlist, $evts) {
    for (var i = 0; i < eventlist.times.length; i++) {
        var date = eventlist.times[i];
        var title = eventlist.titles[i];
        var number = eventlist.lengths[i];

        var length = Time.Delta.toString(number);

        var $evt = $("<tr></tr>");
        $evt.append($("<td></td>").text(length).addClass("counter"));
        $evt.append($("<td></td>").text(title).addClass("title"));
        $evts.append($evt);
    }
}
