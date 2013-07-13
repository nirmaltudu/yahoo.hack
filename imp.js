var q = require('./query_place');

var capture = function(inp) {
    return inp;
}
var clone = function(fn) {
    return fn.bind({});
};
if(require.main == module) {
    var src = process.argv[2];
    var dest = process.argv[3];
    //console.log(src);
    //console.log(dest);
    //console.log("Checking source: " + src);
    q(src);
    //console.log("Checking destination: " + dest);
    q(dest);
}
