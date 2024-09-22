// ==UserScript==
// @name         WME Link to Geoportal Luxembourg
// @description  Adds a button to Waze Map Editor to open the Geoportal of Luxembourg with the coordinates of the current WME location.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.22.08
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*/editor*
// @grant        none
// @author       Dancingman81
// ==/UserScript==

(function() {
    'use strict';

    // Function to extract query string from URL
    function getQueryString(link, name) {
        var pos = link.indexOf(name + '=') + name.length + 1;
        var len = link.substr(pos).indexOf('&');
        if (len === -1) len = link.substr(pos).length;
        return link.substr(pos, len);
    }

    // Function to adjust zoom for Geoportal Luxembourg
    function adjustZoomForGeoportal(wmeZoom) {
        return wmeZoom;  // Passe den Zoom-Level für das Geoportal an
    }

    // Create the button for Luxembourg Geoportal
    function createLuxButton() {
        var lux_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white">Geoportal Luxemburg</button>');
        
        lux_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');

            var lon = parseFloat(getQueryString(href, 'lon'));
            var lat = parseFloat(getQueryString(href, 'lat'));
            var zoom = parseInt(getQueryString(href, 'zoom')) + CorrectZoom(href);

            zoom = adjustZoomForGeoportal(zoom);

            // Check if Proj4js is available before transforming coordinates
            if (typeof proj4 !== 'undefined') {
                try {
                    // Konvertiere WGS84-Koordinaten (Längengrad/Breitengrad) in LUREF
                    var wgs84Proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
                    var lurefProj = "+proj=lcc +lat_1=49.833333 +lat_2=51.166667 +lat_0=49 +lon_0=6 +x_0=80000 +y_0=100000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";  // LUREF Projektion
                    var luref = proj4(wgs84Proj, lurefProj, [lon, lat]);  // Umwandlung von Längengrad/Breitengrad in LUREF (X, Y)

                    var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + zoom + '&X=' + luref[0] + '&Y=' + luref[1] + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';

                    window.open(mapsUrl, '_blank');
                } catch (error) {
                    console.error("Error in coordinate transformation: ", error);
                }
            } else {
                console.error("Proj4js library is not loaded.");
            }
        });

        return lux_btn;
    }

    // Insert the button into the WME sidepanel
    function addButton() {
        if (document.getElementById('user-info') == null) {
            setTimeout(addButton, 500);
            console.log('user-info element not yet available, page still loading');
            return;
        }

        // Check if the button already exists
        if (document.getElementById("sidepanel-lux") !== null) {
            console.log("Button already exists.");
            return; // Exit if the button is already present
        }

        var addon = document.createElement('section');
        addon.id = "lux-addon";

        addon.innerHTML = '<b><p style="font-family:verdana"; "font-size:16px">GEOPORTAL LUXEMBURG</b></p>';

        var userTabs = document.getElementById('user-info');
        var navTabs = document.getElementsByClassName('nav-tabs', userTabs)[0];
        var tabContent = document.getElementsByClassName('tab-content', userTabs)[0];

        var newtab = document.createElement('li');
        newtab.innerHTML = '<a href="#sidepanel-lux" data-toggle="tab">Geo LUX</a>';
        navTabs.appendChild(newtab);

        addon.id = "sidepanel-lux";
        addon.className = "tab-pane";
        tabContent.appendChild(addon);

        $("#sidepanel-lux").append(createLuxButton());
    }

    addButton();

    // Load Proj4js dynamically in advance
    (function loadProj4() {
        var script = document.createElement("script");
        script.type = 'text/javascript';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.4/proj4.js';
        document.getElementsByTagName('head')[0].appendChild(script);

        script.onload = function() {
            console.log("Proj4js loaded successfully.");
        };

        script.onerror = function() {
            console.error("Failed to load Proj4js.");
        };
    })();

    // Function to correct zoom level based on whether it's a livemap or editor
    function CorrectZoom(link) {
        var found = link.indexOf('livemap');
        return (found === -1) ? 13 : 2;
    }
})();
