use strict;
use warnings "all";

use WWW::Mechanize;
use JSON qw( decode_json );

use constant GEO_URL => 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places.parent%20where%20child_woeid%20in%20(select%20woeid%20from%20geo.places%20where%20text%3D%22<PLACE>%22)&format=json&diagnostics=true&callback=cbfunc';
my $mech = WWW::Mechanize->new();
$mech->get("http://www.stationcodes.com/");

my $html = $mech->content();
$html =~ s/.*?\<table\>(.*?)\<\/table\>.*/$1/sg;

my $stn_re = '\<TD\s*class="stnname"\>\<A\s*HREF=.*?\>(.*)\s*\<\/A\>\<\/TD\>\s*\<TD\s*class="stncode"\>(.*?)\<\/TD\>';
while ($html =~ /$stn_re/gi) {
    my ($name, $code) = ($1, $2);
    my $result = get_geo_code($name);
    foreach my $res (@$result) {
        print join("\t", $name, $code, $res->[0], $res->[1]), "\n";
    }
}

sub get_geo_code {
    my $loc = $_[0];
    $loc =~ s/^\s*(.*?)\s*$/$1/g;
    (my $geo_url = GEO_URL) =~ s/\<PLACE\>/$loc/;
    $mech->get($geo_url);
    (my $json_data = $mech->content) =~ s/^cbfunc\((.*?)\)\;$/$1/s;
    eval {   $json_data = JSON->new->utf8->decode($json_data); }; 
    if ($@) {
	return [];
    }
    my $list = $json_data->{query}->{results}->{place};
    my $result = [];
    if (ref($list) eq 'ARRAY') {
	foreach my $cent (@$list) {
	    push(@$result, [$cent->{centroid}->{latitude}, $cent->{centroid}->{longitude}]);
	}
    } else {
	push(@$result, [$list->{centroid}->{latitude}, $list->{centroid}->{longitude}]);
    }
    return $result;
}
