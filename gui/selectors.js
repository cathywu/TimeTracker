// Some selectors: functions that can select blocks

Selectors = {
    RE: function(re, grp) {
        this.re = re;
        this.group = grp;
    },
};

Selectors.RE.prototype.start = function(date, title, number) {
    console.log(this.re, title);
    return title.search(this.re) > -1;
};
Selectors.RE.prototype.cont = Selectors.RE.prototype.start;
