var map;
var poly;
var markers = [];


function run(e){
    var val = e.value;
    var animation = document.getElementById("animar");
    console.log(animation.checked);

    if(animation.checked){
        popo(val);
    }else{
        mapQueryPath(val);
    }
}

var geo = navigator.geolocation;     /*     Here we will check if the browser supports the Geolocation API; if exists, then we will display the location     */
function getLocation() {
    if( geo ) {
        geo.getCurrentPosition( displayLocation );
    }
    else  { alert( "Oops, Geolocation API is not supported");
}
}

/*     This function displays the latitude and longitude when the browser has a location.     */

function displayLocation( position ) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var send = latitude + "," + longitude;
    console.log(latitude + "," + longitude);
    fetchClosestBus(send);
}

function fetchClosestBus(locat){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://tazdingo.mooo.com:3000/api/nearest/" + locat;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var str = xmlhttp.responseText;
            //console.log(str);
            var obj = JSON.parse(str);
            var tmp = obj[0].st_astext;
            tmp = tmp.replace(/[{()}]/g, '');
            tmp = tmp.replace('POINT', '');
            var coords = tmp.split(' ');
            var myLatLng = {lat: Number(coords[0]), lng: Number(coords[1])};
            //console.log(coords[0] + coords[1]);
            addNearestBusMarker(myLatLng, obj[0].name);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}



// Adds a marker to the map and push to the array.
function addMarker(location, var_name) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: var_name
    });
    markers.push(marker);
}

function addAccessMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon:"http://maps.google.com/mapfiles/ms/micons/green.png"
    });
    markers.push(marker);
}

function addNearestBusMarker(location, var_name) {
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        title: var_name,
        icon:"http://maps.google.com/mapfiles/ms/micons/pink.png"
    });
    markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function posturas(){
    var postura = document.getElementById("postura").checked;
    //console.log(postura);
    if(postura){
        if(markers.length==0){
            for(var i=1; i<63; i++){
                posturasMarkers(i);
            }
        }else{
            showMarkers()
        }
    }
    else{
        clearMarkers();
    }
}



function posturasMarkers(id){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://tazdingo.mooo.com:3000/api/posturas/" + id;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var post_lat, post_lng;
            var str = xmlhttp.responseText;
            //console.log(str);
            var obj = JSON.parse(str);
            var local_post_regex = obj[0].local_post;
            local_post = local_post_regex.match(/\(([^)]+)\)/g);
            local_post = local_post[0].replace(/[{()}]/g, '');
            local_post = local_post.split(' ');
            post_lat = local_post[0];
            post_lng = local_post[1];
            //console.log(post_lat, post_lng)
            var parse = obj[0].lugares_post;
            var regex_array = parse.match(/\(([^)]+)\)/g);
            var tmp;
            var myLatLng;
            for (var i = 0; i < regex_array.length; i++){
                tmp = regex_array[i];
                tmp = tmp.replace(/[{()}]/g, '');
                tmp = tmp.replace('MULTILINESTRING', '');
                var parse = tmp.split(',');
                //console.log("parse\n");
                //console.log(parse);

                for (var j = 0; j < parse.length; j++){
                    if(parse[j]){
                        var coords = parse[j].split(' ');
                        //console.log(coords);
                        myLatLng = {lat: Number(coords[0]), lng: Number(coords[1])};
                        addAccessMarker(myLatLng);
                    }
                }
            }
            myLatLng = {lat: Number(post_lat), lng: Number(post_lng)};
            addMarker(myLatLng, obj[0].name);
            //console.log(coord_array);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 41.157944, lng: -8.629105},
        zoom: 8
    });
}

function moveMarker(map, marker, latlng) {
    marker.setPosition(latlng);
    map.panTo(latlng);
}

function autoRefresh(map, pathCoords) {
    if(poly){
        poly.setMap(null);
        poly = null;
    }

    var i, route, marker;
    var polyOptions = {
        path: [],
        geodesic : true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        editable: false,
        map:map
    }
    route = new google.maps.Polyline(polyOptions);
    marker= new google.maps.Marker({map:map,icon:"http://maps.google.com/mapfiles/ms/micons/blue.png"});

    map.setZoom(17);

    for (i = 0; i < pathCoords.length; i++) {
        var coords = pathCoords[i].split(/[ ]+/);
        setTimeout(function (coords)
        {
            var latlng = new google.maps.LatLng(coords[0], coords[1]);
            route.getPath().push(latlng);
            moveMarker(map, marker, latlng);
            console.log("bla");
        }, 500 * i, coords);
    }

}

function popo(id){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://tazdingo.mooo.com:3000/api/paths/" + id;
    var coord_array = [];

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var str = xmlhttp.responseText;
            //console.log(str);
            var regex_array = str.match(/\(([^)]+)\)/g);
            var tmp;
            for (var i = 0; i < regex_array.length; i++){
                tmp = regex_array[i];
                tmp = tmp.replace(/[{()}]/g, '');
                tmp = tmp.replace('MULTILINESTRING', '');
                var parse = tmp.split(',');
                //console.log("parse\n");
                //console.log(parse);
                for (var j = 0; j < parse.length; j++){
                    //console.log(parse[i]);
                    coord_array.push(parse[j]);
                }
            }
            autoRefresh(map, coord_array);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


function generatePathList(){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://tazdingo.mooo.com:3000/api/paths/";
    var obj;
    var array = [];
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var str = xmlhttp.responseText;
            //console.log(str);
            obj = JSON.parse(str);
            //console.log(obj);
            for (var k in obj){
                //console.log(obj[k].id_car);
                array.push(obj[k].id_car);
            }
        }
        array.sort( function(a,b){return a-b});
        //console.log(array);
        var select = document.getElementById("path");
        for (var i in array){
            var option = document.createElement('option');
            option.innerHTML = array[i];
            option.setAttribute("value", array[i]);
            select.appendChild(option);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function mapQueryPath(id){
    var xmlhttp = new XMLHttpRequest();
    var url = "http://tazdingo.mooo.com:3000/api/paths/" + id;
    var coord_array = [];

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var str = xmlhttp.responseText;
            console.log(str);
            var regex_array = str.match(/\(([^)]+)\)/g);
            var tmp;
            for (var i = 0; i < regex_array.length; i++){
                tmp = regex_array[i];
                tmp = tmp.replace(/[{()}]/g, '');
                tmp = tmp.replace('MULTILINESTRING', '');
                var parse = tmp.split(',');
                //console.log("parse\n");
                //console.log(parse);
                for (var j = 0; j < parse.length; j++){
                    //console.log(parse[i]);
                    coord_array.push(parse[j]);
                }
            }
            mapPolyLine(coord_array);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


function mapPolyLine(coordinates) {

    if(poly){
        poly.setMap(null);
        poly = null;
    }
    var polyOptions = {
        path: [],
        geodesic : true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        editable: false,
        map:map
    }
    poly = new google.maps.Polyline(polyOptions);
    poly.setMap(map);

    var path = [];
    var lat, lng;
    //console.log(coordinates);
    for (var i = 0; i < coordinates.length; i++){
        var coords = coordinates[i].split(/[ ]+/);
        if(i==0){
            lat = coords[0];
            lng = coords[1];
        }
        //console.log("lat: " + coords[0] + ",lng: " + coords[1]);
        path.push(new google.maps.LatLng(coords[0], coords[1]));
    }

    poly.setPath(path);
    map.setZoom(15);
    map.setCenter(new google.maps.LatLng(lat, lng));

}
