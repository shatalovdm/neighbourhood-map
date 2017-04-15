$(document).ready(function() {
	var config;

	$.getJSON('config.json', function(json) {
	    console.log(json); // this will show the info it in firebug console
	    config = json;
	});

	$.ajax({
	    url: 'https://api.yelp.com/v3/businesses/search',
	    method: 'GET',
	    data: 'term=food&location=Chicago',
	    dataType: 'jsonp',
	    headers: {"Authorization":"Bearer SofPnaGSPTbeHmaz1jL7ffk9o11W5M9TD1E2vxPhQRTZSL3O3L12zeL6SuKlES2jM5thVxuqJh-crHBJnEYCstRw0XvO4L8EgsaYFFWe8e9_9WWYqO4lcO_3FArxWHYx"},
	    xhrFields: {
	    // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
	    // This can be used to set the 'withCredentials' property.
	    // Set the value to 'true' if you'd like to pass cookies to the server.
	    // If this is enabled, your server must respond with the header
	    // 'Access-Control-Allow-Credentials: true'.
	    withCredentials: false
	  	},
	    success: function(data) {
	    	console.log(data);
	    }
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
	                                    console.log('error[' + errorThrown + '], status[' + textStatus + '], jqXHR[' + JSON.stringify(jqXHR) + ']');
	                        }
	                );



});









