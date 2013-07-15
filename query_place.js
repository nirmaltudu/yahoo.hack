var rest = require('restler');
var fs = require('fs');
var dist = require('./distance');
var airfare = require('./airfare');
var url = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places.parent%20where%20child_woeid%20in%20(select%20woeid%20from%20geo.places%20where%20text%3D%22<PLACE>%22)&format=json&diagnostics=true&callback=cbfunc';
var type = Function.prototype.call.bind( Object.prototype.toString );
var json_out = 'output.json';
var return_val = {'route': {}};
var global_count = 0;
var getLocation = function (src, dest, date) {
    var uri = url.replace('<PLACE>', src);
    var onComplete = buildfn(src, "source", date);
    rest.get(uri).on('complete', onComplete);
    var uri = url.replace('<PLACE>', dest);
    var onComplete = buildfn(dest, "destination", date);
    rest.get(uri).on('complete', onComplete);
};

var buildfn = function (loc, typ, date) {
	var onComplete = function(result, response) {
	    result = result.replace(/^cbfunc\(|\)\;$/g, '');
	    try {
	        var j_res = JSON.parse(result);
	        var place = j_res['query']['results']['place'];
	    } catch(e) {
		console.log(e);
		return;
	    }
	    var centroid = null
	    if (type(place) == '[object Array]') {
		centroid = place[0]['centroid'];
	    } else  {
		centroid = place['centroid']
	    }
	    var lat = centroid['latitude'];
	    var lng = centroid['longitude'];
	    var l = new Location(loc, lat, lng);
	    var all_stations = get_rail_coords();
	    var dist = get_nearest(l, all_stations, 'rail');
	    console.log("Checking : " + loc);
	    console.log("Nearest station: " + dist[1].name + "; distance: " + dist[0]);
	    var all_airports = get_airport_coords();
	    var dist1 = get_nearest(l, all_airports, 'airport');
	    console.log("Nearest airport: " + dist1[1].name + "; distance: " + dist1[0]);
	    if (typ == 'source') {
	        return_val['route']['source'] = {'location' : {'name' : l.name , 'latitude' : l.lat , 'longitude': l.lng }, 'nearest_rail': {'name': dist[1].name, 'code': dist[1].code, 'latitude': dist[1].lat, 'longitude': dist[1].lng}, 'nearest_airport' : {'name': dist1[1].name,'code': dist1[1].code, 'latitude': dist1[1].lat, 'longitude': dist1[1].lng}};
	    } else {
	        return_val['route']['destination'] = {'location' : {'name' : l.name , 'latitude' : l.lat , 'longitude': l.lng }, 'nearest_rail': {'name': dist[1].name, 'code': dist[1].code, 'latitude': dist[1].lat, 'longitude': dist[1].lng, 'distance' : dist[0]}, 'nearest_airport' : {'name': dist1[1].name,'code': dist1[1].code, 'latitude': dist1[1].lat, 'longitude': dist1[1].lng, 'distance': dist1[0]}};
	    }
	    global_count++;
	    if (global_count == 2) {
	        fs.writeFileSync("client_data.json", JSON.stringify(return_val));
      	   	//airfare.getFare(return_val['route']['source']['nearest_airport']['code'],
		//        	           return_val['route']['destination']['nearest_airport']['code'], 
		//			   date);
	    }
	};
	return onComplete;
};

var get_nearest = function(loc, points, pt_type) {
    var nearestPoint = null;
    var minDist = null;
    for (i in points) {
	var pt = points[i];
	var city = null;
	if (pt_type == 'rail') {
	    city = pt.name.toString('utf-8').trim();
	} else {
	    city = pt.city.toString('utf-8').trim();
	}
	if (city.toLowerCase() == loc.name.toLowerCase()) {
	    return [0, pt];
	}
    }
    for (i in points) {
	var pt = points[i];
	var d = dist.getDistance(loc, pt);
	if (minDist == null) {
	    minDist = d;
	}
	if (minDist > d) {
	    minDist = d;
	    nearestPoint = pt;
	}
    }
    return [minDist, nearestPoint];
}

var get_rail_coords = function() {
    var rail_data = fs.readFileSync('rail_stn_info.txt');
    rail_data = rail_data.toString();
    var rows = rail_data.split('\n');
    var all_stations = [];
    for(i in rows) {
	row = rows[i]
	if (row.length ==0) {
	    continue;
	}
	eles = row.split('\t');
	all_stations.push(new Station(eles[0], eles[1], eles[2], eles[3]));
    }
    return all_stations;
}

var get_airport_coords = function() {
    var airport_data = fs.readFileSync('airport_info.txt');
    airport_data = airport_data.toString();
    var rows = airport_data.split('\n');
    var all_airports = [];
    for(i in rows) {
	row = rows[i];
	if (row.length == 0) {
	    continue;
	}
	eles = row.split('\t');
	all_airports.push(new Airport(eles[0], eles[1], eles[2], eles[3], eles[4]));
    }
    return all_airports;
}

var Location = function(name, lat, lng) {
    this.name = name;
    this.lat = lat;
    this.lng = lng;
};

var Station = function(name, code, lat, lng) {
    this.name = name;
    this.code = code;
    this.lat = lat;
    this.lng = lng;
};

var Airport = function(city, name, code, lat, lng) {
    this.city = city;
    this.name = name;
    this.code = code;
    this.lat = lat;
    this.lng = lng;
};	

exports.get_location = getLocation;

