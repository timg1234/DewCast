function comfortLevel(dp) {
  if (dp >= 75) return "😱 Oppressive";
  if (dp >= 70) return "🥵 Very Humid";
  if (dp >= 65) return "😓 Muggy";
  if (dp >= 60) return "😐 Humid";
  if (dp >= 55) return "🙂 Comfortable";
  if (dp >= 50) return "😌 Comfy";
  return "🥰 Very Comfy";
}

function showForecast(data) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";
  let count = 0;
  for (let i = 0; i < data.length && count < 24; i += 3) {
    const hour = data[i];
    const box = document.createElement("div");
    box.className = "forecast-box";
    const f = Math.round((hour.dewpoint.value * 9 / 5) + 32);
    const date = new Date(hour.startTime);
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const weekday = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    box.innerHTML =
      "<strong>" + time + "</strong><br>" +
      weekday + "<br>" +
      f + "°F<br>" +
      comfortLevel(f);
    container.appendChild(box);
    count++;
  }
}

function fetchDewPoint(lat, lon, cityLabel) {
  document.getElementById("location-label").textContent = "Loading dew point forecast for " + cityLabel + "...";
  fetch("https://api.weather.gov/points/" + lat + "," + lon)
    .then(res => res.json())
    .then(data => fetch(data.properties.forecastHourly))
    .then(res => res.json())
    .then(data => {
      showForecast(data.properties.periods);
      document.getElementById("location-label").textContent = "Forecast loaded for " + cityLabel;
    })
    .catch(err => {
      console.error(err);
      document.getElementById("location-label").textContent = "Failed to load forecast";
    });
}

function reverseGeocode(lat, lon, callback) {
  fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=" + lat + "&lon=" + lon)
    .then(res => res.json())
    .then(data => {
      const city = data.address.city || data.address.town || data.address.village || "your area";
      const state = data.address.state || "";
      callback(city + ", " + state);
    })
    .catch(() => callback("your location"));
}

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      reverseGeocode(lat, lon, function(label) {
        fetchDewPoint(lat, lon, label);
      });
    },
    err => {
      console.error("Geolocation error:", err);
      document.getElementById("location-label").textContent = "Location access denied";
    }
  );
} else {
  document.getElementById("location-label").textContent = "Geolocation not supported";
}
