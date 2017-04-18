// Neighborhood Map
// Created by Dmitry Shatalov
'use strict';

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
    		getMapData();
			getOpenTableData();
    	}
	}

  	self.filterRestaurants = ko.computed(function() {
        if (!self.filterName() && !self.filterAddress() && (self.filterPrice() == 'Any')) {
        	return self.restaurants();
        } else {
        	return ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
        		if (self.filterPrice() == 'Any') {
        			return (restaurant.name.toLowerCase().indexOf(self.filterName().toLowerCase()) !== -1) && 
            		(restaurant.address.toLowerCase().indexOf(self.filterAddress().toLowerCase()) !== -1);
        		} else {
        			return (restaurant.name.toLowerCase().indexOf(self.filterName().toLowerCase()) !== -1) && 
            		(restaurant.address.toLowerCase().indexOf(self.filterAddress().toLowerCase()) !== -1) && 
            		(restaurant.price == self.filterPrice()); 
        		}
            	
            });
        }
    });
  	
}

var restaurantsViewModel = new RestaurantsViewModel();

// Get restaurants from OpenTable API located within provided 'zip' code
function getOpenTableData() {
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
    			//Display the list of restaurants
    			$(".restaurant-list").css("display", "block");
	    	}
	    }
	})
}


var map;
var geocoder;

// Get map from Google Maps API centered by 'zip' code
function getMapData() {
	geocoder = new google.maps.Geocoder();
	var zip = restaurantsViewModel.zipSearch();
	zip = !zip ? '60601': zip;

	geocoder.geocode( { 'address': zip + '+usa' }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		//Got result, center the map and put it out there
			map = new google.maps.Map(document.getElementById('map'), {
			center: results[0].geometry.location,
			scrollwheel: false,
			zoom: 15
		});
		} else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}

var s = document.createElement("script");
s.type = "text/javascript";
s.src  = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Xrr0-0B6jLNfz2eOWCUH_Avt4jXvHBs&v=3&callback=getMapData";
$("head").append(s);  




