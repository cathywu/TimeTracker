// Contains some functions to search arrays.
//
// Currently implements binary search (default) and interpolation search.

function binary_search(data, value, lean) {
    function searcher(left_idx, right_idx) {
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = data[left_idx];
            var right_key = data[right_idx];

            if (value < left_key) {
                return left_idx;
            } else if (value > right_key) {
                return right_key;
            } else if (value === left_key) {
                return left_idx;
            } else if (value === right_key) {
                return right_idx;
            } else if (lean === "left" || !lean) {
                return left_idx;
            } else {
                return right_idx;
            }
        } else {
            var midpoint = Math.round((right_idx - left_idx) / 2 + left_idx);
            var midpoint_key = data[midpoint];

            if (value < midpoint_key) {
                return searcher(left_idx, midpoint);
            } else if (value > midpoint_key) {
                return searcher(midpoint, right_idx);
            } else {
                return midpoint;
            }
        }
    }

    return searcher(0, data.length);
}

function interpolation_search(data, value, lean) {
    function searcher(left_idx, right_idx) {
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = data[left_idx];
            var right_key = data[right_idx];

            if (value < left_key) {
                return left_idx;
            } else if (value > right_key) {
                return right_idx;
            } else if (value === left_key) {
                return left_idx;
            } else if (value === right_key) {
                return right_idx;
            } else if (lean === "left" || !lean) {
                return left_idx;
            } else {
                return right_idx;
            }
        } else {
            var left_key = data[left_idx];
            var right_key = right_idx < data.length ? data[right_idx] : data[right_idx - 1];

            var midpoint = Math.round((value - left_key) / (right_key - left_key)
                                      * (right_idx - left_idx) + left_idx);
            if (midpoint <= left_idx) midpoint = left_idx+1;
            if (midpoint >= right_idx) midpoint = right_idx-1;

            var midpoint_key = data[midpoint];

            if (value < midpoint_key) {
                return searcher(left_idx, midpoint);
            } else if (value > midpoint_key) {
                return searcher(midpoint, right_idx);
            } else {
                return midpoint;
            }
        }
    }

    return searcher(0, data.length);
}

array_search = binary_search;

function slice_data(data, start_t, end_t) {
    var left_idx  = array_search(data.times, start_t, "left");
    var right_idx = end_t ? array_search(data.times, end_t, "right") : data.times.length;
    // left_idx <= start_time, right_idx >= end_time
    if (data.times[left_idx] + data.lengths[left_idx] <= start_t) {
        left_idx += 1;
    }

    var output = new TimeSlice(start_t, end_t);

    if (data.times[right_idx] + data.lengths[right_idx] <= start_t) return output;

    output.times = data.times.slice(left_idx, right_idx);
    output.titles = data.titles.slice(left_idx, right_idx);
    output.lengths = data.lengths.slice(left_idx, right_idx);

    if (output.times.length == 0) { return output; }

    if (!end_t) {
        end_t = output.times[output.times.length - 1] +
            output.lengths[output.lengths.length - 1];
        output.end = end_t;
    }

    var last = output.times.length - 1;

    if (output.times[0] < start_t) {
        var extra = Math.round(output.times[0] - start_t);
        output.times[0]   += extra;
        output.lengths[0] -= extra;
    }

    var output_end = output.times[last] + output.lengths[last];
    if (output_end > end_t) {
        var extra = Math.round(output_end - end_t)
        output.lengths[last] -= extra

        if (output.lengths[last] == 0) {
            output.times = output.times.subarray(0, output.times.length - 1);
            output.titles.pop();
            output.lengths.pop();
        }
    }

    return output;
}

function TimeSlice(start_t, end_t) {
    this.times = [];
    this.titles = [];
    this.lengths = [];
    this.start = start_t;
    this.end = (end_t || start_t);
}

TimeSlice.prototype.slice = function(start_t, end_t) {
    return slice_data(this, start_t, end_t);
}

TimeLog.prototype.slice = function(start_t, end_t) {
    return slice_data(this, start_t, end_t);
}

function merge_data(slices, output) {
    var indices = slices.map(function() { return 0; });

    var out = 0;
    var len = slices.map(function(x) { return x.times.length; }).reduce(function(a, b) { return a + b; });
    output.times = new Float64Array(len);
    output.lengths = new Int32Array(len);
    output.titles = new Array(len);

    var done = false;
    while (!done) {
        done = true;
        var min_t = false;
        var min_idx = false;
        for (var i = 0; i < slices.length; i++) {
            if (slices[i].times.length > indices[i]) {
                if (done || slices[i].times[indices[i]] < min_t) {
                    min_t = slices[i].times[indices[i]];
                    min_idx = i;
                    done = false;
                }
            }
        }

        if (done) break;

        for (var i = 0; i < slices.length; i++) {
            if (i !== min_idx && slices[i].times.length > indices[i]) {
                if (slices[i].times[indices[i]] <
                    min_t + slices[min_idx].lengths[indices[min_idx]]) {
                    console.error("Overlapping time slices", min_idx, "and", i,
                                  [min_t, min_t + slices[min_idx].lengths[indices[min_idx]]],
                                  [slices[i].times[indices[i]], slices[i].times[indices[i]] + slices[i].lengths[indices[i]]]);
                }
            }
        }

        output.times[out] = slices[min_idx].times[indices[min_idx]];
        output.lengths[out] = slices[min_idx].lengths[indices[min_idx]];
        output.titles[out] = slices[min_idx].titles[indices[min_idx]];
        indices[min_idx]++;
        out++;
    }

    return output;

}

TimeMerge.prototype.slice = function(start_t, end_t) {
    var slices = this.logs.map(function(x) { return x.slice(start_t, end_t) });
    var output = new TimeSlice(start_t, end_t);
    return merge_data(slices, output);
}
