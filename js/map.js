        var map;
        var markers;
        var clickedCoordiantes = null;

        export const mapOperations = 
        {
            init: (containerId = "map", center = [51.76, 18.1], zoom = 13) => 
            {
                map = L.map(containerId).setView(center, zoom);
                L.tileLayer(
                  "https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=rzjuBxtTYSE5vuJ6CLby",
                  {
                    attribution:
                      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
                  }
                ).addTo(map);
                markers = L.layerGroup().addTo(map);
                setTimeout(() => { map.invalidateSize(); }, 200);

                map.on('click', (e) =>
                {
                    const lt = e.latlng.lat;
                    const lg = e.latlng.lng;
                    let evt = new CustomEvent("mapClickedEvent", { detail: {lt, lg} });
                    document.dispatchEvent(evt);
                })
            },

            clear: () =>
            {
                if(markers) markers.clearLayers();
            },

            addMarker: (latitude, longitude, popupHtml = null) =>
            {
                if(!markers) return null;
                let m = L.marker([latitude, longitude]);
                if(popupHtml) m = m.bindPopup(popupHtml);
                markers.addLayer(m);
                return m;
            },

            zoomIntoPrzystanek: (lt, lg, level = 16) =>
            {
                if(map) map.setView([lt, lg], level);
            },

            getCoordinates: () =>
            {
                return clickedCoordiantes;   
            }
        }