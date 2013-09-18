// Some selectors: functions that can select blocks

function parse_query(q, cls) {
    return new Selectors.RE(q);
}

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
