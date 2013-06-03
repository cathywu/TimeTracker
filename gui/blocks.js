// Some utility functions on blocks; in particular, block selection
// and padding is implemented here.

function select_blocks(data, res) {
    var blocks = [];
    var total = 0;
    var last_time = 0;

    var s = 1000;

    function push(time, type, number) {
        start_time = time - 0; // Convert Date to *milliseconds* since epoch
        end_time = start_time + number*s

        if (!blocks.length) {
            last_time = end_time;
            blocks.push([number, type, time, void(0)]);
            total += number;
        } else {
            if (start_time - last_time <= 1*s) {
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
                var skip = Math.round((start_time - last_time) / s);
                blocks[blocks.length - 1][3] = last_time;
                blocks.push([skip, "", last_time, start_time]);
                blocks.push([number, type, start_time, void(0)]);
                total += skip + number;
            }

            last_time = end_time;
        }
    }
    
    for (var i in data) {
        var date = data[i][0];
        var title = data[i][1];
        var number = data[i][2];

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
    var s = 1000;

    var total_skip = 0;

    if (fst_block[2] != start_day) {
        var skip = Math.round((fst_block[2] - start_day) / s);
        blocks.unshift([skip, "", start_day - 0, fst_block[2]]);
        total_skip += skip;
    }

    if (lst_block[3] < end_day) {
        var skip = Math.round((end_day - lst_block[3]) / s);
        blocks.push([skip, "", lst_block[2], end_day - 0]);
        total_skip += skip;
    }

    return total_skip;
}

function datetime_to_date(datetime) {
    return new Date(datetime.getYear() + 1900, datetime.getMonth(), datetime.getDate());
}

function mapPerDay(start_time, end_time, func) {
    var hour = 1000 * 60 * 60;
    var day = hour * 24;

    var start = (datetime_to_date(start_time) - 0);
    var end = (datetime_to_date(end_time) - 0) + day;

    var out = [];
    for (; start < end - hour; start += day) { // hour is float padding
        out.push(func(new Date(start), new Date(start + day)));
    }
    return out;
}
