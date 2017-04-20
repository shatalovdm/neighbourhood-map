// Neighborhood Map
// Created by Dmitry Shatalov

'use strict';

var changed = false;

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
	self.zipSearch = ko.observable('60602');

	// Get estaurants accoring to the zip code 
	self.searchZip = function() {
		if (self.zipSearch().length != 5 || isNaN(self.zipSearch())) {
    		$(".search").addClass("has-error");
    	} else {
    		self.restaurants().length = 0;
    		$("caption").html("Restaurants provided by OpenTable");
    		getMapData();
    	}
	}

	// Highlight selected marker
	self.enableMarker = function(restaurant) {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].id === restaurant.id) {
				highlightMarker(markers[i]);
				break;
			}
		}
	}

	// Revert marker to default styling
	self.disableMarker = function(restaurant) {
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].id === restaurant.id) {
				revertMarker(markers[i]);
				break;
			}
		}
	}

	// Filter restaurants by name, address, and price
  	self.filterRestaurants = ko.computed(function() {
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
		    		// Create new Restaurant object
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




