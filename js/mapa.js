var map = L.map('map').setView([42.0, 1.2], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

var embalses = [
  ["Embalse de la Baells", 42.138835583361, 1.8682165296514084, "https://ca.wikipedia.org/wiki/Pant%C3%A0_de_la_Baells"],
  ["Embalse de la Llosa del Cavall", 42.11966817338164, 1.5988518409687011, "https://es.wikipedia.org/wiki/Embalse_de_la_Llosa_del_Cavall"],
  ["Embalse de Sant Ponç", 41.97537642037058, 1.5976023814964886, "https://es.wikipedia.org/wiki/Embalse_de_Sant_Pon%C3%A7"],
  ["Embalse de Rialb", 41.975427388646786, 1.2423560652999557, "https://es.wikipedia.org/wiki/Embalse_de_Rialb"],
  ["Embalse de Sant Llorenç de Montgai", 41.86194287029707, 0.8406121041139809, "https://es.wikipedia.org/wiki/Embalse_de_San_Lorenzo_de_Montgai"],
  ["Embalse de Camarasa", 41.93591018731386, 0.8570316629180127, "https://es.wikipedia.org/wiki/Embalse_de_Camarasa"],
  ["Embalse de Oliana", 42.11567002202512, 1.3057341243913554, "https://es.wikipedia.org/wiki/Embalse_de_Oliana"],
  ["Embalse de Talarn (Sant Antoni)", 42.20345325277467, 0.952909899063342, "https://es.wikipedia.org/wiki/Embalse_de_San_Antonio"],
  ["Embalse de Canelles", 41.98653555649076, 0.6143740124472465, "https://es.wikipedia.org/wiki/Embalse_de_Canelles"]
];

embalses.forEach(function ([nombre, lat, lon, url]) {
  const popupContent = `<a href="${url}" target="_blank" rel="noopener noreferrer">${nombre}</a>`;
  L.marker([lat, lon]).addTo(map).bindPopup(popupContent);
});
