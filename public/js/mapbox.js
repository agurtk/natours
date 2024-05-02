/* eslint-disable */

// console.log(locations);

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYW1pZzg4IiwiYSI6ImNsdXBuaGl3ZTF0aDAyanA3ZnF5MnczMDIifQ.pLHao5p2v_FOMp-G_uZS2g";
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/amig88/cluquqb5l011g01pe02gnf9gc",
    scrollZoom: false,
    //   center: [-118.113491,34.111745],
    //   zoom: 4,
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    // create marker
    const marker = document.createElement("div");
    marker.className = "marker";
    // add marker
    new mapboxgl.Marker({
      element: marker,
      anchor: "bottom",
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);
    // extend map bounds to include current location
    bounds.extend(location.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, "top-right");
};
