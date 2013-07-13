var fs = require('fs');
var data = fs.readFileSync('cleartrip.json');
var d = JSON.parse(data.toString());
var min = null;
var min_ind = null;
for (i in d['fare']) {
    var pr = d['fare'][i]['R']['pr'];
    if (min == null) {
        min  = pr;
    } 
    if (min > pr) {
        min = pr;
        min_ind = i;
    }
}
console.log(min_ind);
console.log(d['fare'][min_ind]);
