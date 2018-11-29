// Some utility functions on blocks; in particular, block selection
// and padding is implemented here.

function select_blocks(data, queries) {
    var blocks = [];
    var total = 0;
    var last_time = 0;

    function push(q, time, type, number) {
        start_time = time;
        end_time = start_time + number;

        if (!blocks.length) {
            last_time = end_time;
            blocks.push([number, type, time, void(0), q]);
            total += number;
        } else {
            if (start_time - last_time <= MIN_GAP) {
                var last = blocks[blocks.length - 1];
                if (last[1] == type) {
                    last[0] += number;
                    total += number;
                } else {
                    last[3] = start_time;
                    if (last[4]) last[4].add_block(last);
                    blocks.push([number, type, start_time, void(0), q]);
                    total += number;
                }
            } else {
                var skip = Math.round(start_time - last_time);
                var last = blocks[blocks.length - 1];
                last[3] = last_time;
                if (last[4]) last[4].add_block(last);

                blocks.push([skip, "", last_time, start_time, null]);
                blocks.push([number, type, start_time, void(0), q]);
                total += skip + number;
            }

            last_time = end_time;
        }
    }
    
    var last = null;
    for (var i = 0; i < data.times.length; i++) {
        var date = data.times[i];
        var title = data.titles[i];
        var number = data.lengths[i];
        var tail = []
        var tail_start = -1;

        if (last) {
            if (last.selector.start(date, title, number)) {
                for (var j = 0; j < tail.length; j++) {
                    push(last, tail[j][0], last.id, tail[j][1]);
                }
                tail = [];
                tail_start = -1;
                push(last, date, last.id, number);
                continue;
            } else if (last.selector.cont(date, title, number)) {
                if (tail_start < 0) tail_start = i;
                tail.push([date, number]);
                continue;
            } else {
                if (tail_start >= 0) i = tail_start;
                last = null;
                continue;
            }
        }

        for (var q of queries) {
            var sel = q.selector;
            if (sel.start(date, title, number)) {
                push(q, date, q.id, number);
                last = q;
                break;
            }
        }

        if (!last) {
            push(null, date, "?", number);
        }
    }

    var last = blocks[blocks.length - 1];
    last[3] = last_time;
    if (last[4]) last[4].add_block(last)

    return {blocks: blocks, total: total}
}

function pad_blocks_day(blocks, start_day, end_day) {
    var fst_block = blocks[0];
    var lst_block = blocks[blocks.length - 1];

    var total_skip = 0;

    if (fst_block[2] - start_day > MIN_GAP) {
        var skip = Math.round(fst_block[2] - start_day);
        blocks.unshift([skip, "", start_day, fst_block[2]]);
        total_skip += skip;
    }

    if (end_day - lst_block[3] > MIN_GAP) {
        var skip = Math.round(end_day - lst_block[3]);
        blocks.push([skip, "", lst_block[2], end_day]);
        total_skip += skip;
    }

    return total_skip;
}
