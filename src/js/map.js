// Neighborhood Map
// Created by Dmitry Shatalov

'use strict';

var map;
var geocoder;
var markers = [];
var isHighlighted = false;
var previousMarker;
var previousInfoWindow;

// Get map from Google Maps API centered by 'zip' code
function getMapData() {
	// Map style provided by StipeP on snazzymaps.com
	var styles = [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}];

	geocoder = new google.maps.Geocoder();
	var zip = restaurantsViewModel.zipSearch();

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
	var bounds = new google.maps.LatLngBounds();

	// If the are any markers already, remove them from the map
	if (markers) { removeMarkers(); }

	// No markers are highlighted when they are created
	isHighlighted = false;

	for (var i = 0; i < restaurants.length; i++) {
		(function() {
			var restaurant = restaurants[i];
			var location = {lat: restaurant.lat, lng: restaurant.lng};
			// Creare a marker
			restaurant.marker = new google.maps.Marker({
			    position: location,
			    map: map,
			    title: restaurant.name
	        });
	        markers.push(restaurant.marker);
	        restaurant.marker.addListener('click', function() {
	        	displayMarker(restaurant);
	        });

	        // Expend the map coverage to show all the markers
	        bounds.extend(restaurant.marker.position);
		}());
	}
	map.panToBounds(bounds);
}

// Display marker on the map
function displayMarker(restaurant) {
	// If there is already highlighted marker, revert it first
	if (isHighlighted) { revertMarker(previousMarker, previousInfoWindow); }

	restaurant.infowindow = new google.maps.InfoWindow();
	previousInfoWindow = restaurant.infowindow;
	previousMarker = restaurant.marker;
	highlightMarker(restaurant.marker);
    populateInfoWindow(restaurant.marker, restaurant);
}

// Hide markers when filter restaurants 
function hideMarkers(restaurants) {
	var restaurant;
	for (var i = 0; i < restaurantsViewModel.restaurants().length; i++) {
		restaurant = restaurantsViewModel.restaurants()[i];
		if (!restaurants.includes(restaurant)) {
			revertMarker(restaurant.marker, restaurant.infowindow);
			restaurant.marker.setVisible(false);
		} else {
			restaurant.marker.setVisible(true);
		}
	}
}

// Populate the info window with information about a restaurant which marker represents
function populateInfoWindow(marker, restaurant) {
// Check to make sure the infowindow is not already opened on this marker.
	if (restaurant.infowindow.marker != marker) {
		restaurant.infowindow.marker = marker;
		restaurant.infowindow.setContent('<div>' + marker.title + '</div>' + '<div>' + restaurant.address + '</div>' + 
			'<div style="margin-top:5px">' + '<a class="btn btn-primary" href="' + restaurant.link + '" role="button">Reserve </a>' + '</div>');
		restaurant.infowindow.open(map, marker);
		// Clear marker property and revert the marker when closed
		restaurant.infowindow.addListener('closeclick',function() {
            revertMarker(marker, restaurant.infowindow);
        });
        google.maps.event.addListener(map, "click", function(event) {
            revertMarker(marker, restaurant.infowindow);
		});
	}
}

// Highlight marker by changing marker picture
function highlightMarker(marker) {
	isHighlighted = true;
	var image = {
	  url: 'img/marker.png',
	  origin: new google.maps.Point(0, 0),
	  scaledSize: new google.maps.Size(50, 50)
	};
	marker.setIcon(image);
}

// Revert to a default style of a marker
function revertMarker(marker, infowindow) {
	isHighlighted = false;
	marker.setIcon();
	infowindow.close();
}

// Remove all markers from the map
function removeMarkers(){
    for(var i=0; i<markers.length; i++){
        markers[i].setMap(null);
    }
    markers.length = 0;
}

// Handle the case when Google Maps API could not be loaded
function googleError() {
	document.getElementById("map").innerHTML = " Could not load Google Maps. Try again later.";
}