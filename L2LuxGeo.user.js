// ==UserScript==
// @name         WME Link to Geoportal Luxembourg and Traffic Info
// @description  Adds buttons to Waze Map Editor to open the Geoportal of Luxembourg and the Luxembourg traffic info portal.
// @namespace    https://github.com/Dwinger2006/Dancingman81   
// @version      2024.10.01.2
// @include      https://*.waze.com/editor*
// @include      https://*.waze.com/*editor*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.6.2/proj4.js
// @author       Dancingman81
// @license      MIT
// @syncURL      https://github.com/Dwinger2006/Dancingman81/raw/main/L2LuxGeo.user.js
// @downloadURL https://update.greasyfork.org/scripts/510495/WME%20Link%20to%20Geoportal%20Luxembourg%20and%20Traffic%20Info.user.js
// @updateURL https://update.greasyfork.org/scripts/510495/WME%20Link%20to%20Geoportal%20Luxembourg%20and%20Traffic%20Info.meta.js
// ==/UserScript==

(async function() {
    'use strict';

    // Function to extract parameters from URL
    function getQueryString(url, param) {
        var params = new URLSearchParams(url.split('?')[1]);
        return params.get(param);
    }

    // Function to create Luxembourg Geoportal Button
    function createLuxButton() {
        console.log("Creating Geoportal Luxembourg button");
        var lux_btn = document.createElement('button');
        lux_btn.style = "width: 285px;height: 24px; font-size:85%;color: Green;border-radius: 5px;border: 0.5px solid lightgrey; background: white; margin-bottom: 10px;";
        lux_btn.innerHTML = "Geoportal Luxemburg";

        lux_btn.addEventListener('click', function() {
            let coords = W.map.getUnvalidatedUnprojectedCenter();
            let point = new OpenLayers.LonLat(coords.lon, coords.lat)
            let transformed = point.transform('EPSG:4326', 'EPSG:3857');

            // Verwende die umgerechneten Koordinaten in der URL
            var mapsUrl = 'https://map.geoportail.lu/theme/main?lang=de&version=3&zoom=' + coords.zoom + '&X=' + transformed.lon + '&Y=' + transformed.lat + '&rotation=0&layers=549-542-302-269-320-2056-351-152-685-686&opacities=1-0-0-0-1-0-1-1-1-1&time=------------------&bgLayer=streets_jpeg&crosshair=true';
            
            console.log("Geoportal URL:", mapsUrl);

            window.open(mapsUrl, '_blank');
        });

        return lux_btn;
    }

    // Function to create Luxembourg Traffic Info Button
    function createTrafficButton() {
        console.log("Creating Traffic Info button");
        var traffic_btn = document.createElement('button');
        traffic_btn.style = "width: 285px;height: 24px; font-size:85%;color: Red;border-radius: 5px;border: 0.5px solid lightgrey; background: white;";
        traffic_btn.innerHTML = "Verkehrsinformationen Luxemburg";

        traffic_btn.addEventListener('click', function() {
            var href = document.querySelector('.WazeControlPermalink a').getAttribute('href');
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

    if (!W.userscripts.state.isReady) {
        console.log("WME is not ready yet, retrying...");
        document.addEventListener("wme-ready", addButtons, { once: true });
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

    addon.appendChild(luxButton);
    addon.appendChild(trafficButton);

    console.log("Buttons added successfully.");
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
})();
