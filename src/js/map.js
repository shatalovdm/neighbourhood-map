// Neighborhood Map
// Created by Dmitry Shatalov

'use strict';

var map;
var geocoder;
var markers = [];
var isHighlighted = false;

// Get map from Google Maps API centered by 'zip' code
function getMapData() {
	// Map style provided by StipeP on snazzymaps.com
	var styles = [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}]

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
	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();
	var location;
	var restaurant;
	var previousMarker;

	// If the are any markers already, remove them from the map
	if (markers) { removeMarkers(); }

	// No markers are highlighted when they are created
	isHighlighted = false;

	if (restaurants.length > 0) {
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
	        	// If there is already highlighted marker, revert it first
	        	if (isHighlighted) { revertMarker(previousMarker); }
	        	highlightMarker(this);
	        	previousMarker = this;
	        	isHighlighted = true;
	            populateInfoWindow(this, restaurant, largeInfowindow);
	        });

	        // Expend the map coverage to show all the markers
	        bounds.extend(markers[i].position);
		}
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

// Revert to a default style of a marker
function revertMarker(marker) {
	marker.setIcon();
}

// Populate the info window with information about a restaurant which marker represents
function populateInfoWindow(marker, restaurant, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent('<div>' + marker.title + '</div>' + '<div>' + restaurant.address + '</div>' + 
			'<div>' + '<a class="btn btn-primary" href="restaurant.link" role="button">Reserve a table</a>' + '</div>');
		infowindow.open(map, marker);
		// Clear marker property and revert the marker when closed
		infowindow.addListener('closeclick',function(){
            infowindow.setMarker = null;
            revertMarker(marker);
        });
        google.maps.event.addListener(map, "click", function(event) {
            revertMarker(marker);
            isHighlighted = false;
		    infowindow.setMarker = null;
		    infowindow.close();
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

// Load Google maps API
var s = document.createElement("script");
s.type = "text/javascript";
s.src  = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Xrr0-0B6jLNfz2eOWCUH_Avt4jXvHBs&v=3&callback=getMapData";
$("head").append(s);  