// ==UserScript==
// @name         WME Link to Geoportal Luxembourg and Traffic Info
// @description  Adds buttons to Waze Map Editor to open the Geoportal of Luxembourg and the Luxembourg traffic info portal.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.09.22.12
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*/editor*
// @grant        none
// @author       Dancingman81
// ==/UserScript==

(function() {
    'use strict';

    function createLuxButton() {
        var lux_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white">Geoportal Luxemburg</button>');
        
        lux_btn.click(function() {
            var href = $('.WazeControlPermalink a').attr('href');
            var lon = parseFloat(getQueryString(href, 'lon')); 
            var lat = parseFloat(getQueryString(href, 'lat')); 
            var zoom = parseInt(getQueryString(href, 'zoom')) + CorrectZoom(href);

            zoom = adjustZoomForGeoportal(zoom);

            // Beispiel: Logik für das Geoportal Luxemburg (bereits implementiert)
            var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + zoom + '&X=' + lon + '&Y=' + lat + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';
            window.open(mapsUrl, '_blank');
        });

        return lux_btn;
    }

    function createTrafficButton() {
        var traffic_btn = $('<button style="width: 285px;height: 24px; font-size:85%;color: Red;border-radius: 5px;border: 0.5px solid lightgrey; background: white">Verkehrsinformationen Luxemburg</button>');
        
        traffic_btn.click(function() {
            // Öffne das Verkehrs-Geoportal in einem neuen Tab
            var trafficUrl = 'https://travaux.public.lu/fr/infos-trafic/chantiers/routes.html';
            window.open(trafficUrl, '_blank');
        });

        return traffic_btn;
    }

    function addButtons() {
        if (document.getElementById('user-info') == null) {
            setTimeout(addButtons, 500);
            return;
        }

        if (document.getElementById("sidepanel-lux") !== null) {
            console.log("Buttons already exist.");
            return;
        }

        var addon = document.createElement('section');
        addon.id = "lux-addon";
        addon.innerHTML = '<b><p style="font-family:verdana"; "font-size:16px">PORTALE LUXEMBURG</b></p>';

        var userTabs = document.getElementById('user-info');
        var navTabs = document.getElementsByClassName('nav-tabs', userTabs)[0];
        var tabContent = document.getElementsByClassName('tab-content', userTabs)[0];

        var newtab = document.createElement('li');
        newtab.innerHTML = '<a href="#sidepanel-lux" data-toggle="tab">Geo + Traffic LUX</a>';
        navTabs.appendChild(newtab);

        addon.id = "sidepanel-lux";
        addon.className = "tab-pane";
        tabContent.appendChild(addon);

        // Füge beide Buttons hinzu
        $("#sidepanel-lux").append(createLuxButton());
        $("#sidepanel-lux").append(createTrafficButton());
    }

    addButtons();
})();
