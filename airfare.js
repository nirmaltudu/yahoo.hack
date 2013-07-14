var fs = require('fs');
var rest = require('restler');
var url = 'http://www.cleartrip.com/lst';
//var url = 'http://www.cleartrip.com/flights/results/airjson?trip_type=OneWay&from=<SRC>&to=<DEST>&depart_date=<DATE>&adults=1&childs=0&infants=0&class=Economy&airline=&carrier=&ver=V2&type=json&intl=n&sd=1373765243753&page=&search_ver=V2&cc=1';

var buildfn1 = function() {
    var onComplete1 = function(result, response) {
	result = result.replace(/^cbfunc\(|\)\;$/g, '');
	try {
            var j_data = JSON.parse(result);
	} catch(e) {
	    console.error(e);
	    return;
	}
	var min = null;
	var min_ind = null;
	for (i in j_data['fare']) {
	    try {
	    var pr = j_data['fare'][i]['R']['pr'];
	    } catch (e) {
		    console.error(e);
		    continue;
	    }
	    if (min == null) {
	        min  = pr;
		min_ind = i;
	    } 
	    if (min > pr) {
	        min = pr;
	        min_ind = i;
	    }
	}
	var data = fs.readFileSync('client_data.json');
	var j_data = JSON.parse(data.toString());
	j_data['route']['cost'] = min;
	fs.writeFileSync('client_data.json', JSON.stringify(j_data));
    };
    return onComplete1;
};
var getFare = function(src, dest, date) {
    var onComplete1 = buildfn1();
    rest.post(url, {'trip_type' : 'OneWay',
    'from' : src,
    'to' : dest,
    'depart_date' : date,
    'return_date' : '',
    'adults' : 1,
    'childs' : 0,
    'infants' : 0,
    'class' : 'Economy',
    'type' : 'json',
    'airline' : '',
    'carrier' : '',
    'ver' : 'V2'
}).on('complete', onComplete1);
};
exports.getFare = getFare;
