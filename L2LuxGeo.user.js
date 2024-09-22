// ==UserScript==
// @name         WME Link to Geoportal Luxembourg
// @description  Adds a button to Waze Map Editor to open the Geoportal of Luxembourg with the coordinates of the current WME location.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.22.13
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*/editor*
// @grant        none
// @author       Dancingman81
// ==/UserScript==

(function() {
    'use strict';

    function getQueryString(link, name) {
        var pos = link.indexOf(name + '=') + name.length + 1;
        var len = link.substr(pos).indexOf('&');
        if (len === -1) len = link.substr(pos).length;
        return link.substr(pos, len);
    }

    function adjustZoomForGeoportal(wmeZoom) {
        return wmeZoom; 
    }

    function createLuxButton() {
        var lux_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white">Geoportal Luxemburg</button>');
        
        lux_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');

            var lon = parseFloat(getQueryString(href, 'lon')); 
            var lat = parseFloat(getQueryString(href, 'lat')); 
            var zoom = parseInt(getQueryString(href, 'zoom')) + CorrectZoom(href);

            zoom = adjustZoomForGeoportal(zoom);

            console.log("WGS84 Koordinaten: Längengrad =", lon, "Breitengrad =", lat);

            if (typeof proj4 !== 'undefined') {
                try {
                    var wgs84Proj = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
                    var lurefProj = "+proj=lcc +lat_1=49.833333 +lat_2=51.166667 +lat_0=49 +lon_0=6 +x_0=80000 +y_0=100000 +ellps=GRS80 +units=m +no_defs";

                    // Umwandlung von WGS84 in LUREF
                    var luref = proj4(wgs84Proj, lurefProj, [lon, lat]);

                    if (!luref || luref.length !== 2 || isNaN(luref[0]) || isNaN(luref[1])) {
                        throw new Error("Ungültige LUREF-Koordinaten");
                    }

                    console.log("Umgewandelte LUREF-Koordinaten: X =", luref[0], "Y =", luref[1]);

                    // Erstelle die Geoportal-URL mit den umgewandelten LUREF-Koordinaten
                    var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + zoom + '&X=' + luref[0] + '&Y=' + luref[1] + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';

                    window.open(mapsUrl, '_blank');
                } catch (error) {
                    console.error("Fehler bei der Koordinatenumwandlung: ", error);
                }
            } else {
                console.error("Proj4js-Bibliothek ist nicht geladen.");
            }
        });

        return lux_btn;
    }

    function addButton() {
        if (document.getElementById('user-info') == null) {
            setTimeout(addButton, 500);
            return;
        }

        if (document.getElementById("sidepanel-lux") !== null) {
            console.log("Button already exists.");
            return;
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

    (function loadProj4() {
        var script = document.createElement("script");
        script.type = 'text/javascript';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.4.4/proj4.js';
        document.getElementsByTagName('head')[0].appendChild(script);

        script.onload = function() {
            console.log("Proj4js erfolgreich geladen.");
        };

        script.onerror = function() {
            console.error("Fehler beim Laden der Proj4js-Bibliothek.");
        };
    })();

    function CorrectZoom(link) {
        var found = link.indexOf('livemap');
        return (found === -1) ? 13 : 2;
    }
})();
