
// ==UserScript==
// @name         WME Link to Geoportal Luxembourg and Traffic Info
// @description  Adds buttons to Waze Map Editor to open the Geoportal of Luxembourg and the Luxembourg traffic info portal.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.29.11
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*editor*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.6.2/proj4.js
// @author       Dancingman81
// @license      MIT
// @syncURL      https://github.com/Dwinger2006/Dancingman81/raw/main/L2LuxGeo.user.js
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

    // Function to convert WGS84 coordinates to LUREF with offset correction
    function convertCoordinates(lon, lat) {
        var wgs84Proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        var lurefProj = "+proj=lcc +lat_1=49.833333 +lat_2=51.166667 +lat_0=49 +lon_0=6 +x_0=80000 +y_0=100000 +ellps=GRS80 +units=m +no_defs";
        var luref = proj4(wgs84Proj, lurefProj, [lon, lat]);

        // Applying average offsets to correct the LUREF coordinates
        var offsetX = 62832.74;  // Calculated average X-offset
        var offsetY = 72901.08;  // Calculated average Y-offset

        luref[0] += offsetX;
        luref[1] += offsetY;

        return luref;
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

            // Verwende die umgerechneten Koordinaten in der URL
            var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + zoom + '&X=' + luref[0].toFixed(2) + '&Y=' + luref[1].toFixed(2) + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';
            
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

        var addon = document.createElement('section');
        addon.id = "lux-addon";
        addon.innerHTML = '<b><p style="font-family:verdana; font-size:16px;">PORTALE LUXEMBURG</b></p>';

        var userTabs = document.getElementById('user-info');
        var navTabs = document.getElementsByClassName('nav-tabs', userTabs)[0];
        var tabContent = document.getElementsByClassName('tab-content', userTabs)[0];

        var newtab = document.createElement('li');
        newtab.innerHTML = '<a href="#sidepanel-lux" data-toggle="tab">Geo + Traffic LUX</a>';
        navTabs.appendChild(newtab);

        var newtabContent = document.createElement('div');
        newtabContent.id = "sidepanel-lux";
        newtabContent.className = "tab-pane";
        newtabContent.appendChild(addon);

        tabContent.appendChild(newtabContent);

        var luxButton = createLuxButton();
        var trafficButton = createTrafficButton();

        addon.appendChild(luxButton[0]);
        addon.appendChild(trafficButton[0]);
    }

    // Initialize the script
    function initialize() {
        if (document.readyState === 'complete') {
            addButtons();
        } else {
            window.addEventListener('load', addButtons);
        }
    }

    // Start the script
    initialize();
})();
