use strict;
use warnings "all";
use WWW::Mechanize;
use JSON qw( decode_json );
use constant GEO_URL => 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places.parent%20where%20child_woeid%20in%20(select%20woeid%20from%20geo.places%20where%20text%3D%22<PLACE>%22)&format=json&diagnostics=true&callback=cbfunc';
use constant LIST_URL => 'http://www.maxholidays.com/airports-in-india.html';
my $mech = WWW::Mechanize->new();
$mech->get(LIST_URL);

my $html = $mech->content();
$html =~ s/\s*\&nbsp\;\s*//g;
my $re = '\<tr\>\s*\<td bgcolor\=\"#FCFCFC\"\>(.*?)\s*\<\/td\>\s*\<td bgcolor\=\"#FCFCFC\"\>(.*?)\s*\<\/td\>\s*\<td bgcolor\=\"#FCFCFC"\>(.*?)\s*\<\/td\>\s*\<td bgcolor\=\"#FCFCFC\"\>(.*?)\s*\<\/td\>\s*\<\/tr\>';
my $state = 'AN Islands (Union Territory)';
while ($html =~ /$re/sgi) {
	# my @match = ($1, $2, $3, $4);
	my @match = ($1, $4, $3);
	@match = map { s/\s*\&nbsp\;\s*//g; $_;} @match;
	my $rest = join("", @match[1,2]);
	if ($rest =~ /^\s*$/) {
	    $state = $match[0];
	    next ;
	}
	my $result = get_geo_code($match[1]);
	foreach my $res (@$result) {
	    next unless ($res->[0] or $res->[1]);
	    print join("\t", @match, $res->[0], $res->[1]), "\n";
	}
}

sub get_geo_code {
    my $loc = $_[0];
    $loc =~ s/^\s*(.*?)\s*$/$1/g;
    (my $geo_url = GEO_URL) =~ s/\<PLACE\>/$loc/;
    $mech->get($geo_url);
    (my $json_data = $mech->content) =~ s/^cbfunc\((.*?)\)\;$/$1/s;
    $json_data = decode_json($json_data);
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

