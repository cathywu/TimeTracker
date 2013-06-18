// Contains some functions to search arrays.
//
// Currently implements binary search and interpolation search.
//
// Should be used through array_search, which has some logic to select
// the better algorithm.  It does look as though binary search really
// is usually better.  Interpolation might be better for the inital
// step where day sequences are split out, though.

function binary_search(data, value, lean) {
    var time = 0;
    
    function searcher(left_idx, right_idx) {
        time++;
        
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = data[left_idx];
            var right_key = data[right_idx];

            if (value === left_key) {
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

    var out = searcher(0, data.length-1);
    binary_search.times.count++;
    binary_search.times.sum += time / Math.log(data.length);
    return out;
}
binary_search.times = {sum: 0, count: 0}

function interpolation_search(data, value, lean) {
    var time = 0;
    
    function searcher(left_idx, right_idx) {
        time++;
        
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = data[left_idx];
            var right_key = data[right_idx];

            if (value === left_key) {
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
            var right_key = data[right_idx];

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

    var out = searcher(0, data.length-1);
    interpolation_search.times.count++;
    interpolation_search.times.sum += time / Math.log(data.length);
    return out;
}
interpolation_search.times = {sum: 0, count: 0}

function array_search(data, value, lean) {
    if (Math.random() < .1) {
        var ans1 = binary_search(data, value, lean);
        var ans2 = interpolation_search(data, value, lean);
        if (ans1 != ans2) {
            if (window.console && console.log) {
                console.log("Interpolation and Binary Search disagree");
                window.ERROR = {ans1: ans1, ans2: ans2,
                                value: value, lean: lean,
                                data: data};
            }
            interpolation_search.panic = true;
        }

        return ans1;
    } else {
        var binary_avg = binary_search.times.sum / binary_search.times.count;
        var interp_avg = interpolation_search.times.sum / interpolation_search.times.count;
        var fn;

        if (interp_avg < binary_avg && !interpolation_search.times.panic) {
            fn = interpolation_search;
        } else {
            fn = binary_search;
        }

        return fn(data, value, lean);
    }
}

function slice_data(data, start_t, end_t) {
    var left_idx  = array_search(data.times, start_t, "left");
    var right_idx = array_search(data.times, end_t, "left");

    // left_idx <= start_time, right_idx <= end_time
    if (data.times[left_idx] + data.lengths[left_idx] <= start_t) {
        left_idx += 1;
    }

    if (data.times[right_idx] + data.lengths[right_idx] <= start_t) {
        return {times: [], titles: [], lengths: []};
    }

    var output = { times: null, titles: null, lengths: null };
    output.times = data.times.slice(left_idx, right_idx + 1);
    output.titles = data.titles.slice(left_idx, right_idx + 1);
    output.lengths = data.lengths.slice(left_idx, right_idx + 1);
    if (output.times.length == 0) {return output;}

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
            output.times.pop();
            output.titles.pop();
            output.lengths.pop();
        }
    }

    return output;
}
