

$(document).ready(function() {

	'use strict';

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

	var RestaurantsModel = function() {
		var self = this;

		self.restaurants = ko.observableArray();

		self.filterKeyword = ko.observable('');
      
      	self.filterRestaurants = ko.computed(function() {
	        if (!self.filterKeyword()) {
	        	return self.restaurants();
	        } else {
	        	return ko.utils.arrayFilter(self.restaurants(), function(restaurant) {
	            	return restaurant.name.toLowerCase().indexOf(self.filterKeyword().toLowerCase()) !== -1; 
	            });
	        }
	    });

	    $.ajax({
		    url: 'http://opentable.herokuapp.com/api/restaurants',
		    method: 'GET',
		    data: 'zip=60610',
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
		    		self.restaurants.push(new Restaurant(restaurant.name, address, restaurant.lat, 
        			restaurant.lng, restaurant.phone, price, restaurant.image_url, restaurant.reserve_url));
		    	}
		    }
		})
	}

	ko.applyBindings(new RestaurantsModel());
});









