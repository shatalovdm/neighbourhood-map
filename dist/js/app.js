// Neighborhood Map
// Created by Dmitry Shatalov
'use strict';

var map;
var geocoder;
var changed = false;
var markers = [];

$(document).ready(function() {

	ko.applyBindings(restaurantsViewModel);
});

var Restaurant = function(name, address, lat, lng, phone, price, image, link) {
	this.name = name;
	this.address = address;
	this.lat = lat;
	this.lng = lng;
	this.phone = phone;
	this.price = price;
	this.image = image;
	this.link = link;
}

var RestaurantsViewModel = function() {
	var self = this;

	self.restaurants = ko.observableArray();
	self.filterName = ko.observable('');
	self.filterAddress = ko.observable('');
	self.filterPrice = ko.observable('Any');
	self.zipSearch = ko.observable('');

	self.searchZip = function() {
		if (self.zipSearch().length != 5 || isNaN(self.zipSearch())) {
    		$(".search").addClass("has-error");
    	} else {
    		self.restaurants().length = 0;
    		$("caption").html("Results");
    		getMapData();
    	}
	}

  	self.filterRestaurants = ko.computed(function() {
  		//
        if (!self.filterName() && !self.filterAddress() && (self.filterPrice() == 'Any')) {
        	// Draw markers only when the result was filtered 
        	if (changed) { populateMap(self.restaurants()); }
        	return self.restaurants();
        } else {
        	changed = true;
        	var filteredRestaurants = ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
        		if (self.filterPrice() == 'Any') {
        			return (restaurant.name.toLowerCase().indexOf(self.filterName().toLowerCase()) !== -1) && 
            		(restaurant.address.toLowerCase().indexOf(self.filterAddress().toLowerCase()) !== -1);
        		} else {
        			return (restaurant.name.toLowerCase().indexOf(self.filterName().toLowerCase()) !== -1) && 
            		(restaurant.address.toLowerCase().indexOf(self.filterAddress().toLowerCase()) !== -1) && 
            		(restaurant.price == self.filterPrice()); 
        		}
            	
            });
            populateMap(filteredRestaurants);
        	return filteredRestaurants;
        }
    });
}

var restaurantsViewModel = new RestaurantsViewModel();

// Get restaurants from OpenTable API located within provided 'zip' code
function getOpenTableData() {
	if (restaurantsViewModel.zipSearch()) {
	    $.ajax({
		    url: 'http://opentable.herokuapp.com/api/restaurants',
		    method: 'GET',
		    data: 'zip=' + restaurantsViewModel.zipSearch(),
	  		dataType: 'jsonp',
		    success: function(data) {
		    	for (var i = 0; i < data.restaurants.length; i++) {
		    		var restaurant = data.restaurants[i];
		    		var address = restaurant.address + ', ' + restaurant.postal_code;
		    		var price;
		    		switch (restaurant.price) {
		    			case 1:
		    				price = '$';
		    				break;
		    			case 2:
		    				price = '$$';
		    				break;
		    			case 3:
		    				price = '$$$';
		    				break;
		    			case 4:
		    				price = '$$$$';
		    				break;
		    			default:
		    				price = '';
		    		}
		    		restaurantsViewModel.restaurants.push(new Restaurant(restaurant.name, address, restaurant.lat, 
	    			restaurant.lng, restaurant.phone, price, restaurant.image_url, restaurant.reserve_url));
		    	}
	    		// Populate the map with markers
	    		populateMap(restaurantsViewModel.restaurants());
				//Display the list of restaurants
	    		$(".restaurant-list").css("display", "block");
		    }
		})
		.fail(function() {
	    	$("caption").html("Could not load the OpenTable data. Try again later.");
	    })
	}
}

// Get map from Google Maps API centered by 'zip' code
function getMapData() {
	geocoder = new google.maps.Geocoder();
	var zip = restaurantsViewModel.zipSearch();
	zip = !zip ? '60601': zip;

	geocoder.geocode( { 'address': zip + '+usa' }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map = new google.maps.Map(document.getElementById('map'), {
				center: results[0].geometry.location,
				scrollwheel: false,
				zoom: 15
			});
			getOpenTableData();
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

// Draw markers on the map passing current list of 'restaurants'
function populateMap (restaurants) {
	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var location;
	var restaurant;

	if (markers) { removeMarkers(); }

	for (var i = 0; i < restaurants.length; i++) {
		restaurant = restaurants[i];
		location = {lat: restaurant.lat, lng: restaurant.lng};
		var marker = new google.maps.Marker({
		    position: location,
		    map: map,
		    title: restaurant.name,
		    id: i
        });

        markers.push(marker);

        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
         });
        bounds.extend(markers[i].position);
        // marker.click(function() {
        // 	populateInfoWindow(this, largeInfoWindow);
        // });
	}
	
}

// Remove all markers from the map
function removeMarkers(){
    for(var i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
}

var s = document.createElement("script");
s.type = "text/javascript";
s.src  = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Xrr0-0B6jLNfz2eOWCUH_Avt4jXvHBs&v=3&callback=getMapData";
$("head").append(s);  




