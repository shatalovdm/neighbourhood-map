

$(document).ready(function() {

	'use strict';

	var Restaurant = function(name, address, lat, lng, zip, phone, price, image, link) {
		this.name = name;
		this.address = address;
		this.lat = lat;
		this.lng = lng;
		this.zip = zip;
		this.phone = phone;
		this.price = price;
		this.image = image;
		this.link = link;
	}

	var RestaurantsModel = function() {
		var self = this;

		self.restaurants = ko.observableArray();

	    $.ajax({
		    url: 'http://opentable.herokuapp.com/api/restaurants',
		    method: 'GET',
		    data: 'zip=60613',
	  		dataType: 'jsonp',
		 
		    success: function(data) {

		    	for (var i = 0; i < data.restaurants.length; i++) {
		    		var restaurant = data.restaurants[i];
		    		self.restaurants.push(new Restaurant(restaurant.name, restaurant.address, restaurant.lat, 
        			restaurant.lng, restaurant.postal_code, restaurant.phone,
        			restaurant.price, restaurant.image_url, restaurant.reserve_url))
		    	}
		    }
		})
	}

	ko.applyBindings(new RestaurantsModel());
});









