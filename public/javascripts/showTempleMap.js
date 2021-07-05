// TO MAKE THE MAP APPEAR YOU MUST
// ADD YOUR ACCESS TOKEN FROM



// https://account.mapbox.com
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: temples.geometry.coordinates, // starting position [lng, lat]
    zoom: 5 // starting zoom
});
//adding controls like zoom-in, zoom-out and etc.
map.addControl(new mapboxgl.NavigationControl(),'bottom-right');
 //adding the details in the popup
new mapboxgl.Marker()
    .setLngLat(temples.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${temples.title}</h3><p>${temples.location}</p>`
            )
    )
    .addTo(map)

