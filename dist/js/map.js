$(document).ready(function () {
  var s = document.createElement("script");
  s.type = "text/javascript";
  s.src  = "https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Xrr0-0B6jLNfz2eOWCUH_Avt4jXvHBs&v=3&callback=initMap";

  $("body").append(s); 

  window.initMap = function() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 40.7413549, lng: -73.9980244},
      zoom: 13
    });
    var tribeca = {lat: 40.719526, lng: -74.0089934};
    var marker = new google.maps.Marker({
      position: tribeca,
      map: map,
      title: 'First Marker!'
    });
  }

});
