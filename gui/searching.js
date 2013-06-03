// Contains some functions to search arrays.
//
// Currently implements binary search and interpolation search.
//
// Should be used through array_search, which has some logic to select
// the better algorithm.  It does look as though binary search really
// is usually better.  Interpolation might be better for the inital
// step where day sequences are split out, though.

function binary_search(data, value, keyfn, lean) {
    var time = 0;
    
    function searcher(left_idx, right_idx) {
        time++;
        
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = keyfn(data[left_idx]);
            var right_key = keyfn(data[right_idx]);

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
            var midpoint_key = keyfn(data[midpoint]);

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

function interpolation_search(data, value, keyfn, lean) {
    var time = 0;
    
    function searcher(left_idx, right_idx) {
        time++;
        
        if (left_idx === right_idx) {
            return left_idx;
        } else if (left_idx + 1 === right_idx) {
            var left_key = keyfn(data[left_idx]);
            var right_key = keyfn(data[right_idx]);

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
            var left_key = keyfn(data[left_idx]);
            var right_key = keyfn(data[right_idx]);

            var midpoint = Math.round((value - left_key) / (right_key - left_key)
                                      * (right_idx - left_idx) + left_idx);
            if (midpoint <= left_idx) midpoint = left_idx+1;
            if (midpoint >= right_idx) midpoint = right_idx-1;

            var midpoint_key = keyfn(data[midpoint]);

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

function array_search(data, value, keyfn, lean) {
    if (Math.random() < .1) {
        var ans1 = binary_search(data, value, keyfn, lean);
        var ans2 = interpolation_search(data, value, keyfn, lean);
        if (ans1 != ans2) {
            if (window.console && console.log) {
                console.log("Interpolation and Binary Search disagree");
                window.ERROR = {ans1: ans1, ans2: ans2,
                                value: value, keyfn: keyfn, lean: lean, data: data};
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

        return fn(data, value, keyfn, lean);
    }
}

function slice_data(data, start_time, end_time) {
    var s = 1000; // In milliseconds

    var left_idx  = array_search(data, start_time,
                                 function(rec){return rec[0];}, "left");
    var right_idx = array_search(data, end_time,
                                 function(rec){return rec[0];}, "left");

    // left_idx <= start_time, right_idx <= end_time
    if ((data[left_idx][0] - 0) + data[left_idx][2]*s <= start_time) {
        left_idx += 1;
    }

    if ((data[right_idx][0] - 0) + data[right_idx][2]*s <= start_time) {
        return [];
    }

    var output = data.slice(left_idx, right_idx + 1);
    if (output.length == 0) {
        return output;
    }

    var left = output[0];
    var right = output[output.length - 1];

    if (left[0] < start_time) {
        var extra = Math.round((left[0] - start_time) / s);
        var new_left_start = new Date((left[0] - 0) + extra*s);
        output[0] = [new_left_start, left[1], left[2] - extra];
    }

    if ((right[0] - 0) + right[2]*s > end_time) {
        var extra = Math.round(((right[0] - end_time) + right[2]*s) / s)
        if (right[2] - extra == 0) {
            output.pop();
        } else {
            output[output.length - 1] = [right[0], right[1], right[2] - extra];
        }
    }

    return output;
}
