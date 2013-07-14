var q = require('./query_place');
var fs = require('fs');

var capture = function(inp) {
    return inp;
}
var clone = function(fn) {
    return fn.bind({});
};
if(require.main == module) {
    var src = process.argv[2];
    var dest = process.argv[3];
    var date = process.argv[4];
    q.get_location(src, dest, date);
}
