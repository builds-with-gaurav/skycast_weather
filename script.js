/* ============================================================
   Skycast — script.js
   Supports: city, state (auto-maps to capital), country,
             area, village, "city, state" combos
   ============================================================ */

const API_KEY = '9d51ee9e63f0b6c2d6d2b4bc3be6b7f0';

let currentUnit      = 'metric';
let currentData      = null;
let lastLocationLabel = '';


/* ── India State → Capital City Map ────────────────────────── */

const INDIA_STATES = {
  'andhra pradesh':          'Visakhapatnam',
  'arunachal pradesh':       'Itanagar',
  'assam':                   'Dispur',
  'bihar':                   'Patna',
  'chhattisgarh':            'Raipur',
  'goa':                     'Panaji',
  'gujarat':                 'Gandhinagar',
  'haryana':                 'Chandigarh',
  'himachal pradesh':        'Shimla',
  'jharkhand':               'Ranchi',
  'karnataka':               'Bangalore',
  'kerala':                  'Thiruvananthapuram',
  'madhya pradesh':          'Bhopal',
  'maharashtra':             'Mumbai',
  'manipur':                 'Imphal',
  'meghalaya':               'Shillong',
  'mizoram':                 'Aizawl',
  'nagaland':                'Kohima',
  'odisha':                  'Bhubaneswar',
  'punjab':                  'Chandigarh',
  'rajasthan':               'Jaipur',
  'sikkim':                  'Gangtok',
  'tamil nadu':              'Chennai',
  'telangana':               'Hyderabad',
  'tripura':                 'Agartala',
  'uttar pradesh':           'Lucknow',
  'up':                      'Lucknow',
  'uttarakhand':             'Dehradun',
  'west bengal':             'Kolkata',
  'delhi':                   'New Delhi',
  'jammu and kashmir':       'Srinagar',
  'jammu & kashmir':         'Srinagar',
  'j&k':                     'Srinagar',
  'ladakh':                  'Leh',
  'andaman and nicobar':     'Port Blair',
  'chandigarh':              'Chandigarh',
  'dadra and nagar haveli':  'Silvassa',
  'daman and diu':           'Daman',
  'lakshadweep':             'Kavaratti',
  'puducherry':              'Puducherry',
  'pondicherry':             'Puducherry',
};

/* World country → capital map (common ones) */
const WORLD_COUNTRIES = {
  'usa':            'New York',
  'united states':  'Washington',
  'uk':             'London',
  'united kingdom': 'London',
  'france':         'Paris',
  'germany':        'Berlin',
  'japan':          'Tokyo',
  'china':          'Beijing',
  'australia':      'Sydney',
  'canada':         'Toronto',
  'brazil':         'Brasilia',
  'russia':         'Moscow',
  'italy':          'Rome',
  'spain':          'Madrid',
  'mexico':         'Mexico City',
  'south korea':    'Seoul',
  'indonesia':      'Jakarta',
  'pakistan':       'Islamabad',
  'bangladesh':     'Dhaka',
  'nepal':          'Kathmandu',
  'sri lanka':      'Colombo',
  'thailand':       'Bangkok',
  'vietnam':        'Hanoi',
  'malaysia':       'Kuala Lumpur',
  'singapore':      'Singapore',
  'uae':            'Dubai',
  'saudi arabia':   'Riyadh',
  'egypt':          'Cairo',
  'nigeria':        'Abuja',
  'south africa':   'Cape Town',
  'kenya':          'Nairobi',
  'argentina':      'Buenos Aires',
  'colombia':       'Bogota',
  'turkey':         'Ankara',
  'iran':           'Tehran',
  'iraq':           'Baghdad',
  'israel':         'Jerusalem',
  'greece':         'Athens',
  'portugal':       'Lisbon',
  'netherlands':    'Amsterdam',
  'belgium':        'Brussels',
  'sweden':         'Stockholm',
  'norway':         'Oslo',
  'denmark':        'Copenhagen',
  'finland':        'Helsinki',
  'poland':         'Warsaw',
  'ukraine':        'Kyiv',
  'switzerland':    'Zurich',
  'austria':        'Vienna',
  'new zealand':    'Auckland',
  'philippines':    'Manila',
  'myanmar':        'Yangon',
  'cambodia':       'Phnom Penh',
  'afghanistan':    'Kabul',
};


/* ── Smart Query Resolver ───────────────────────────────────── */

function resolveQuery(input) {
  const lower = input.trim().toLowerCase();

  // Check India states first
  if (INDIA_STATES[lower]) {
    return {
      resolvedQuery: INDIA_STATES[lower] + ', IN',
      note: `Showing weather for ${INDIA_STATES[lower]} (capital of ${input.trim()})`
    };
  }

  // Check world countries
  if (WORLD_COUNTRIES[lower]) {
    return {
      resolvedQuery: WORLD_COUNTRIES[lower],
      note: `Showing weather for ${WORLD_COUNTRIES[lower]} (capital of ${input.trim()})`
    };
  }

  // Pass through as-is (city, village, area, "city,state" etc.)
  return { resolvedQuery: input.trim(), note: null };
}


/* ── Live Clock ─────────────────────────────────────────────── */

function updateClock() {
  const now = new Date();
  document.getElementById('liveClock').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();


/* ── Stars Canvas ───────────────────────────────────────────── */

(function initStars() {
  const canvas = document.getElementById('stars');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      o: Math.random() * 0.7 + 0.3,
      flicker: Math.random() * 0.02
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.o += s.flicker * (Math.random() > 0.5 ? 1 : -1);
      s.o  = Math.max(0.1, Math.min(1, s.o));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();


/* ── Rain Drops ─────────────────────────────────────────────── */

function setupRain() {
  const layer = document.getElementById('rainLayer');
  layer.innerHTML = '';
  for (let i = 0; i < 80; i++) {
    const drop = document.createElement('div');
    drop.className = 'raindrop';
    drop.style.left             = Math.random() * 100 + 'vw';
    drop.style.animationDuration = (Math.random() * 0.6 + 0.5) + 's';
    drop.style.animationDelay   = (Math.random() * 2) + 's';
    drop.style.opacity          = Math.random() * 0.5 + 0.2;
    layer.appendChild(drop);
  }
}
setupRain();


/* ── Unit Toggle ────────────────────────────────────────────── */

function setUnit(unit) {
  currentUnit = unit;
  document.getElementById('btnC').classList.toggle('active', unit === 'metric');
  document.getElementById('btnF').classList.toggle('active', unit === 'imperial');
  if (currentData) renderWeather(currentData, lastLocationLabel);
}

document.getElementById('btnC').addEventListener('click', () => setUnit('metric'));
document.getElementById('btnF').addEventListener('click', () => setUnit('imperial'));


/* ── Weather Emoji ──────────────────────────────────────────── */

function getWeatherEmoji(id, isNight) {
  if (id >= 200 && id < 300) return '⛈';
  if (id >= 300 && id < 400) return '🌦';
  if (id >= 500 && id < 600) return id >= 511 ? '🌨' : '🌧';
  if (id >= 600 && id < 700) return '❄️';
  if (id >= 700 && id < 800) return '🌫';
  if (id === 800) return isNight ? '🌙' : '☀️';
  if (id === 801) return isNight ? '🌙' : '🌤';
  if (id === 802) return '⛅';
  if (id >= 803) return '☁️';
  return '🌡';
}


/* ── Sky Theme ──────────────────────────────────────────────── */

function getBodyClass(id) {
  if (id >= 200 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id >= 700 && id < 800) return 'cloudy';
  if (id === 800)             return '';
  if (id >= 801)              return 'cloudy';
  return '';
}


/* ── Temp Helpers ───────────────────────────────────────────── */

function toFahrenheit(c) { return (c * 9 / 5 + 32).toFixed(1); }

function formatTemp(c) {
  return currentUnit === 'imperial' ? toFahrenheit(c) + '°' : Math.round(c) + '°';
}


/* ── Time Helper ────────────────────────────────────────────── */

function formatTime(unix, tz) {
  return new Date((unix + tz) * 1000).toISOString().slice(11, 16);
}


/* ── Build Location Label ───────────────────────────────────── */

function buildLocationLabel(geo) {
  const parts = [];
  const name  = (geo.local_names && geo.local_names.en) ? geo.local_names.en : geo.name;
  parts.push(name);
  if (geo.state)   parts.push(geo.state);
  if (geo.country) parts.push(geo.country);
  return parts.join(', ');
}


/* ── Render ─────────────────────────────────────────────────── */

function renderWeather(data, locationLabel) {
  const now     = Math.floor(Date.now() / 1000);
  const isNight = now < data.sys.sunrise || now > data.sys.sunset;
  const wid     = data.weather[0].id;

  document.body.className = isNight ? 'night' : getBodyClass(wid);

  document.getElementById('cityName').textContent =
    locationLabel || (data.name + ', ' + data.sys.country);

  document.getElementById('tempDisplay').textContent  = formatTemp(data.main.temp);
  document.getElementById('unitLabel').textContent    = currentUnit === 'metric' ? '°C' : '°F';
  document.getElementById('weatherEmoji').textContent = getWeatherEmoji(wid, isNight);
  document.getElementById('weatherDesc').textContent  = data.weather[0].description;
  document.getElementById('feelsLike').textContent    = 'Feels like ' + formatTemp(data.main.feels_like);

  const windSpeed = currentUnit === 'imperial'
    ? (data.wind.speed * 2.237).toFixed(1) + ' mph'
    : data.wind.speed.toFixed(1) + ' m/s';

  document.getElementById('humidityVal').textContent   = data.main.humidity + '%';
  document.getElementById('windVal').textContent       = windSpeed;
  document.getElementById('visibilityVal').textContent = (data.visibility / 1000).toFixed(1) + ' km';
  document.getElementById('pressureVal').textContent   = data.main.pressure;

  const dew = data.main.temp - ((100 - data.main.humidity) / 5);
  document.getElementById('dewPointVal').textContent  = formatTemp(dew);
  document.getElementById('dewPointUnit').textContent = currentUnit === 'metric' ? '°C' : '°F';
  document.getElementById('cloudVal').textContent     = data.clouds.all;
  document.getElementById('highLowVal').textContent   =
    formatTemp(data.main.temp_max) + ' / ' + formatTemp(data.main.temp_min);

  document.getElementById('sunriseTime').textContent = formatTime(data.sys.sunrise, data.timezone);
  document.getElementById('sunsetTime').textContent  = formatTime(data.sys.sunset,  data.timezone);

  const totalDay = data.sys.sunset - data.sys.sunrise;
  const elapsed  = Math.max(0, Math.min(totalDay, now - data.sys.sunrise));
  const pct      = isNight ? (now > data.sys.sunset ? 100 : 0) : (elapsed / totalDay * 100);

  document.getElementById('daylightFill').style.width = pct.toFixed(1) + '%';
  const hrs  = Math.floor(totalDay / 3600);
  const mins = Math.floor((totalDay % 3600) / 60);
  document.getElementById('daylightLabel').textContent = hrs + 'h ' + mins + 'm daylight';
}


/* ── UI Helpers ─────────────────────────────────────────────── */

function showLoader() {
  document.getElementById('errorMsg').classList.remove('show');
  document.getElementById('weatherContent').classList.remove('show');
  document.getElementById('landingState').style.display = 'none';
  document.getElementById('loader').classList.add('show');
}

function showError(msg) {
  document.getElementById('loader').classList.remove('show');
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
  document.getElementById('landingState').style.display = 'block';
  document.body.className = '';
}

function showWeather() {
  document.getElementById('loader').classList.remove('show');
  document.getElementById('weatherContent').classList.add('show');
}


/* ── Geocode → lat/lon ──────────────────────────────────────── */

async function geocodeLocation(query) {
  const url     = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`;
  const res     = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const results = await res.json();
  if (!results || results.length === 0) throw new Error('Not found');
  return results[0];
}


/* ── Weather by coords ──────────────────────────────────────── */

async function fetchWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return await res.json();
}


/* ── Main Search ────────────────────────────────────────────── */

async function fetchWeather() {
  const input = document.getElementById('locationInput').value.trim();
  if (!input) return;

  showLoader();

  try {
    // Resolve state/country names to searchable queries
    const { resolvedQuery, note } = resolveQuery(input);

    // Geocode to lat/lon
    const geo = await geocodeLocation(resolvedQuery);
    const { lat, lon } = geo;

    // Fetch weather
    const data = await fetchWeatherByCoords(lat, lon);
    currentData = data;

    // Build label — if state was typed, show original context
    lastLocationLabel = note
      ? buildLocationLabel(geo) + '  (' + note + ')'
      : buildLocationLabel(geo);

    showWeather();
    renderWeather(data, buildLocationLabel(geo));

    // Show a soft note if we auto-resolved a state/country
    if (note) {
      const el = document.getElementById('errorMsg');
      el.style.background = 'rgba(30,120,60,0.25)';
      el.style.borderColor = 'rgba(30,180,80,0.4)';
      el.textContent = 'ℹ ' + note;
      el.classList.add('show');
    }

  } catch (err) {
    console.error(err);
    showError('⚠ Could not find "' + input + '". Try a specific city name like "Jaipur" or "Udaipur, Rajasthan".');
  }
}


/* ── Events ─────────────────────────────────────────────────── */

document.getElementById('searchBtn').addEventListener('click', fetchWeather);
document.getElementById('locationInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') fetchWeather();
});