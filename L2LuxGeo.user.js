// ==UserScript==
// @name         WME Link to Geoportal Luxembourg and Traffic Info
// @description  Adds buttons to Waze Map Editor to open the Geoportal of Luxembourg and the Luxembourg traffic info portal.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.26.1
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*/editor*
// @grant        none
// @author       Dancingman81
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract parameters from URL
    function getQueryString(url, param) {
        var params = new URLSearchParams(url.split('?')[1]);
        return params.get(param);
    }

    // Function to create Luxembourg Geoportal Button
    function createLuxButton() {
        console.log("Creating Geoportal Luxemburg button");
        var lux_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white; margin-bottom: 10px;">Geoportal Luxemburg</button>');

        lux_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');
            var lon = parseFloat(getQueryString(href, 'lon')); 
            var lat = parseFloat(getQueryString(href, 'lat')); 
            var zoom = parseInt(getQueryString(href, 'zoom'));

            // WGS84-Projektion (EPSG:4326) zu LUREF-Projektion (EPSG:2169) umwandeln
            var wgs84Proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
            var lurefProj = "+proj=lcc +lat_1=49.833333 +lat_2=51.166667 +lat_0=49 +lon_0=6 +x_0=80000 +y_0=100000 +ellps=GRS80 +units=m +no_defs";

            // Umwandlung der WGS84-Koordinaten zu LUREF
            var luref = proj4(wgs84Proj, lurefProj, [lon, lat]);

            console.log("LUREF Koordinaten:", luref);

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
            var trafficUrl = 'https://travaux.public.lu/fr/infos-trafic/chantiers/routes.html';
            window.open(trafficUrl, '_blank');
        });

        return traffic_btn;
    }

    // Function to add the buttons to the WME script area
    function addButtonsToScriptArea() {
        console.log("Adding buttons...");

        var scriptSection = document.querySelector('.menu-items-container'); // Anpassung an das WME-Layout
        if (!scriptSection) {
            setTimeout(addButtonsToScriptArea, 500);
            return;
        }

        // Check if the panel already exists to avoid duplicate additions
        if (document.getElementById("lux-addon") !== null) {
            console.log("Buttons already exist.");
            return;
        }

        // Create a container for the buttons
        var addon = document.createElement('section');
        addon.id = "lux-addon";
        addon.innerHTML = '<b><p style="font-family:verdana; font-size:16px;">PORTALE LUXEMBURG</b></p>';

        // Append the buttons to the script section
        var luxButton = createLuxButton();
        var trafficButton = createTrafficButton();

        scriptSection.appendChild(addon);
        addon.appendChild(luxButton);
        addon.appendChild(trafficButton);

        console.log("Buttons added successfully");
    }

    addButtonsToScriptArea();
})();
