// User queries and operations on them.

// Selectors are functions that can select blocks

Selectors = {
    RE: function(re) {this.init(re)},
};

Selectors.RE.prototype.init = function(re) {
    this.re = re;
    this.text = re;
};

Selectors.RE.prototype.start = function(date, title, number) {
    return title.search(this.re) > -1;
};

Selectors.RE.prototype.cont = Selectors.RE.prototype.start;

// A Query is a selector and the selected blocks.

function Query(text, data) {
    this.text = text;
    this.selector = this.parse(text);
    this.data = data;

    this.blocks = [];
    this.total = 0;
    this.hist = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
               , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
}

Query.prototype.reset = function() {
    this.blocks = [];
    this.total = 0;
    this.hist = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
}

// Parses a string into selectors.
// For now, just assumes that queries are regular expressions.

Query.prototype.parse = function(text) {
    return new Selectors.RE(text);
}

Query.prototype.block_to_events = function(block) {
    return slice_data(this.data, block.start, block.end);
}

Query.prototype.add_block = function(block_array) {
    // We begin by making a nice pretty object out of the array
    var block = { length: block_array[0],
                  start: block_array[2],
                  end: block_array[3] };

    // First, we record the existence of this block
    this.blocks.push(block);

    // Next, we add on the total time spent in this block
    this.total += block.end - block.start;

    // Next, we update the histogram
    var seconds_in_hour = 60 * 60;
    var prev_hour = Math.floor(block.start / seconds_in_hour) * seconds_in_hour;
    var idx = moment.unix(prev_hour).hour(); // Moment for timezones

    // There are a few cases here. The entire block may lie within
    // a given hour or not; and the first and last hour that the block
    // lies across are likely not to be full hours.

    if (prev_hour + seconds_in_hour >= block.end) {
        this.hist[idx] += block.length / seconds_in_hour;
    } else {
        var head = 1 - ((block.start - prev_hour) / seconds_in_hour);
        this.hist[idx++] += head;
        prev_hour += seconds_in_hour;

        while (prev_hour + seconds_in_hour < block.end) {
            this.hist[idx++] += 1;
        }

        var tail = (block.end - prev_hour) / seconds_in_hour;
        this.hist[idx] += tail;
    }
}
