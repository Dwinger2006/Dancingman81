// ==UserScript==
// @name         WME Link to Geoportal Luxembourg and Traffic Info
// @description  Adds buttons to Waze Map Editor to open the Geoportal of Luxembourg and the Luxembourg traffic info portal.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.27.1
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*/editor*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.6.2/proj4.js
// @author       Dancingman81
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract parameters from URL
    function getQueryString(url, param) {
        var params = new URLSearchParams(url.split('?')[1]);
        return params.get(param);
    }

    // Function to adjust zoom for Geoportal Luxembourg
    function adjustZoomForGeoportal(wmeZoom) {
        return wmeZoom;  // Passe den Zoom-Level für das Geoportal an
    }

    // Function to correct zoom level based on whether it's a livemap or editor
    function CorrectZoom(link) {
        var found = link.indexOf('livemap');
        return (found === -1) ? 13 : 2;
    }

    // Function to convert WGS84 coordinates to LUREF
    function convertCoordinates(lon, lat) {
        var wgs84Proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        var lurefProj = "+proj=lcc +lat_1=49.833333 +lat_2=51.166667 +lat_0=49 +lon_0=6 +x_0=80000 +y_0=100000 +ellps=GRS80 +units=m +no_defs";
        return proj4(wgs84Proj, lurefProj, [lon, lat]);
    }

    // Function to convert decimal degrees to DMS (degrees, minutes, seconds)
    function toDMS(deg, dir) {
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = Math.floor(minfloat);
        var secfloat = (minfloat - m) * 60;
        var s = Math.round(secfloat);
        if (s == 60) {
            m++;
            s = 0;
        }
        if (m == 60) {
            d++;
            m = 0;
        }
        return d + "° " + m + "′ " + s + "″ " + dir;
    }

    // Function to convert decimal degrees to DM (degrees, decimal minutes)
    function toDM(deg, dir) {
        var d = Math.floor(deg);
        var minfloat = (deg - d) * 60;
        var m = minfloat.toFixed(5);
        return d + "° " + m + "′ " + dir;
    }

    // Function to create Luxembourg Geoportal Button
    function createLuxButton() {
        console.log("Creating Geoportal Luxemburg button");
        var lux_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white; margin-bottom: 10px;">Geoportal Luxemburg</button>');

        lux_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');
            var lon = parseFloat(getQueryString(href, 'lon')); 
            var lat = parseFloat(getQueryString(href, 'lat')); 
            var zoom = parseInt(getQueryString(href, 'zoom')) + CorrectZoom(href);

            zoom = adjustZoomForGeoportal(zoom);

            // Umwandlung der WGS84-Koordinaten zu LUREF
            var luref = convertCoordinates(lon, lat);

            console.log("LUREF Koordinaten:", luref);

            // Ausgabe der Ergebnisse in der Konsole
            console.log("Luref: " + luref[0].toFixed(0) + " E | " + luref[1].toFixed(0) + " N");
            console.log("Lon/Lat WGS84: " + lon.toFixed(5) + " E | " + lat.toFixed(5) + " N");
            console.log("Lon/Lat WGS84 DMS: " + toDMS(lon, 'E') + " | " + toDMS(lat, 'N'));
            console.log("Lon/Lat WGS84 DM: " + toDM(lon, 'E') + " | " + toDM(lat, 'N'));

            // Verwende die umgerechneten Koordinaten in der URL
            var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + zoom + '&X=' + luref[0] + '&Y=' + luref[1] + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';
            
            console.log("Geoportal URL:", mapsUrl);

            window.open(mapsUrl, '_blank');
        });

        return lux_btn;
    }

    // Function to create Luxembourg Traffic Info Button
    function createTrafficButton() {
        console.log("Creating Traffic Info button");
        var traffic_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Red;border-radius: 5px;border: 0.5px solid lightgrey; background: white;">Verkehrsinformationen Luxemburg</button>');

        traffic_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');
            var lon = parseFloat(getQueryString(href, 'lon'));
            var lat = parseFloat(getQueryString(href, 'lat'));

            // Versuch, das Portal mit aktivem zweiten Reiter zu öffnen
            var trafficUrl = 'https://travaux.public.lu/fr/infos-trafic/chantiers/routes.html#carte-des-chantiers-routiers?zoom=' + 12 + '&lat=' + lat + '&lon=' + lon + '&layers=2';
            window.open(trafficUrl, '_blank');
        });

        return traffic_btn;
    }

    // Function to add the buttons to the WME side panel
    function addButtons() {
        console.log("Adding buttons...");
        
        if (document.getElementById('user-info') == null) {
            setTimeout(addButtons, 500);
            return;
        }

        // Check if the panel already exists to avoid duplicate additions
        if (document.getElementById("sidepanel-lux") !== null) {
            console.log("Buttons already exist.");
            return;
        }

        var sidepanel = document.createElement('div');
        sidepanel.id = "sidepanel-lux";
        sidepanel.style.marginTop = "10px";

        var luxButton = createLuxButton();
        var trafficButton = createTrafficButton();

        sidepanel.appendChild(luxButton[0]);
        sidepanel.appendChild(trafficButton[0]);

        document.getElementById('user-info').appendChild(sidepanel);
    }

    // Initialize the script
    function initialize() {
        if (document.readyState === 'complete') {
            addButtons();
        } else {
            window.addEventListener('load', addButtons);
        }
    }

    initialize();
})();// ==UserScript==
