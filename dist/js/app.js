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

var Restaurant = function(id, name, address, lat, lng, phone, price, image, link) {
	this.id = id;
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

	self.restaurantId = ko.observable('');
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

	self.enableMarker = function(restaurant) {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].id === restaurant.id) {
				highlightMarker(markers[i]);
				break;
			}
		}
	}

	self.disableMarker = function(restaurant) {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].id === restaurant.id) {
				revertMarker(markers[i]);
				break;
			}
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
		    		restaurantsViewModel.restaurants.push(new Restaurant(restaurant.id, restaurant.name, address, restaurant.lat, 
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
	// Map style provided by StipeP on snazzymaps.com
	var styles = [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}]

	geocoder = new google.maps.Geocoder();
	var zip = restaurantsViewModel.zipSearch();
	zip = !zip ? '60601': zip;

	geocoder.geocode( { 'address': zip + '+usa' }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map = new google.maps.Map(document.getElementById('map'), {
				center: results[0].geometry.location,
				styles: styles,
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

	// If the are any markers already, remove them from the map
	if (markers) { removeMarkers(); }


	for (var i = 0; i < restaurants.length; i++) {
		restaurant = restaurants[i];
		location = {lat: restaurant.lat, lng: restaurant.lng};
		// Creare a marker
		var marker = new google.maps.Marker({
		    position: location,
		    map: map,
		    title: restaurant.name,
		    id: restaurant.id
        });

        markers.push(marker);

        marker.addListener('click', function() {
            populateInfoWindow(this, restaurant, largeInfowindow);
        });



        // Expend the map coverage to show all the markers
        bounds.extend(markers[i].position);
	}
	if (restaurants.length > 0) {
		map.panToBounds(bounds);
	}
}

function highlightMarker(marker) {
	var image = {
	  url: 'img/marker.png',
	  origin: new google.maps.Point(0, 0),
	  scaledSize: new google.maps.Size(50, 50)
	};
	marker.setIcon(image);
}

function revertMarker(marker) {
	marker.setIcon();
}

function populateInfoWindow(marker, restaurant, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent('<div>' + marker.title + '</div>' + '<div>' + restaurant.address + '</div>' + 
			'<div>' + '<a class="btn btn-primary" href="restaurant.link" role="button">Reserve a table</a>' + '</div>');
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
        });
	}
}

// Remove all markers from the map
function removeMarkers(){
    for(var i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    markers.length = 0;
}

var s = document.createElement("script");
s.type = "text/javascript";
s.src  = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Xrr0-0B6jLNfz2eOWCUH_Avt4jXvHBs&v=3&callback=getMapData";
$("head").append(s);  




