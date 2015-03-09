function parseQueryString(){
	var match,
		pl			= /\+/g,  // Regex for replacing addition symbol with a space
		search	= /([^&=]+)=?([^&]*)/g,
		decode	= function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query		= getQueryString();

	urlParams = {};
	while (match = search.exec(query)) {
		urlParams[decode(match[1])] = decode(match[2]);
	}
	return urlParams;
}
function getQueryString() {
	return window.location.search.substring(1);
}