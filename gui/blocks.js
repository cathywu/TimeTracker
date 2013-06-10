// Some utility functions on blocks; in particular, block selection
// and padding is implemented here.

function select_blocks(data, res) {
    var blocks = [];
    var total = 0;
    var last_time = 0;

    function push(time, type, number) {
        start_time = time; // Convert Date to *milliseconds* since epoch
        end_time = start_time + number

        if (!blocks.length) {
            last_time = end_time;
            blocks.push([number, type, time, void(0)]);
            total += number;
        } else {
            if (start_time - last_time <= 5) {
                var last = blocks[blocks.length - 1];
                if (last[1] == type) {
                    last[0] += number;
                    total += number;
                } else {
                    last[3] = start_time;
                    blocks.push([number, type, start_time, void(0)]);
                    total += number;
                }
            } else {
                var skip = Math.round(start_time - last_time);
                blocks[blocks.length - 1][3] = last_time;
                blocks.push([skip, "", last_time, start_time]);
                blocks.push([number, type, start_time, void(0)]);
                total += skip + number;
            }

            last_time = end_time;
        }
    }
    
    for (var i in data.times) {
        var date = data.times[i];
        var title = data.titles[i];
        var number = data.lengths[i];

        var found = false;
        for (var j in res) {
            if (title.search(res[j]) > -1) {
                push(date, j, number);
                found = true;
                break;
            }
        }

        if (!found) {
            push(date, "?", number);
        }
    }

    blocks[blocks.length - 1][3] = last_time;

    return {blocks: blocks, total: total}
}

function pad_blocks_day(blocks, start_day, end_day) {
    var fst_block = blocks[0];
    var lst_block = blocks[blocks.length - 1];

    var total_skip = 0;

    if (fst_block[2] != start_day) {
        var skip = Math.round(fst_block[2] - start_day);
        blocks.unshift([skip, "", start_day, fst_block[2]]);
        total_skip += skip;
    }

    if (lst_block[3] < end_day) {
        var skip = Math.round(end_day - lst_block[3]);
        blocks.push([skip, "", lst_block[2], end_day]);
        total_skip += skip;
    }

    return total_skip;
}

function datetime_to_date(datetime) {
    var s_per_day = 60 * 60 * 24
    return Math.floor(datetime / s_per_day) * s_per_day;
}

function mapPerDay(start_time, end_time, func) {
    var hour = 60 * 60;
    var day = hour * 24;

    var start = (datetime_to_date(start_time));
    var end = (datetime_to_date(end_time)) + day;

    var out = [];
    for (; start < end - hour; start += day) { // hour is float padding
        out.push(func(start, start + day));
    }
    return out;
}
