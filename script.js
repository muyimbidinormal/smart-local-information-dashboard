/**
 * Forin Tech Solutions • Smart Local Information Dashboard
 * Complete Modular Application Script with Dynamic Greeting & Dancing Mascot
 */

/* ========================================================
   1. LIVE CLOCK CONTROLLER
   ======================================================== */
function updateLiveClock() {
    const clockEl = document.getElementById("headerLiveClock");
    if (!clockEl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    clockEl.textContent = `${dateStr} • ${timeStr}`;
}
setInterval(updateLiveClock, 1000);
updateLiveClock();

/* ========================================================
   2. DYNAMIC TIME-BASED GREETING CONTROLLER
   ======================================================== */
let lastGreetingPeriod = "";

const TIME_GREETINGS = {
    morning: {
        headline: "Good morning! ☀️",
        submessage: "Welcome back. Let's make today productive!",
        tag: "MORNING INTELLIGENCE",
        quotes: [
            "Ribbit! Good morning! Let's conquer the day! ☀️🐸",
            "Coffee brewed, data live! Have an awesome morning! ☕✨",
            "Rise and shine! Ready to make today count! 🚀"
        ]
    },
    afternoon: {
        headline: "Good afternoon! 🌤️",
        submessage: "Hope your day is going wonderfully!",
        tag: "MIDDAY DISPATCH",
        quotes: [
            "Good afternoon! Keep that momentum going! 🌤️🐸",
            "Midday energy check! You're doing amazing! ⚡",
            "Ribbit! Halfway through and rocking it! 🎵"
        ]
    },
    evening: {
        headline: "Good evening! 🌅",
        submessage: "Here's your latest local intelligence update.",
        tag: "EVENING INTELLIGENCE",
        quotes: [
            "Good evening! Time to catch up on the day! 🌅🐸",
            "Sun setting, intelligence staying sharp! 🌇✨",
            "Ribbit! Relax and let the dashboard keep watch! 🛋️"
        ]
    },
    night: {
        headline: "Good night owl! 🌙",
        submessage: "We're keeping you informed, even after hours!",
        tag: "AFTER-HOURS MONITOR",
        quotes: [
            "Night owl mode engaged! I'm wide awake! 🌙🐸",
            "Burning the midnight oil? I'm right here with you! 🦉✨",
            "The world sleeps, but the markets and data don't! 💹"
        ]
    }
};

function determineCurrentTimePeriod() {
    const now = new Date();
    const hour = now.getHours();

    // Morning: 5:00 AM – 11:59 AM (hours 5 to 11)
    if (hour >= 5 && hour < 12) {
        return "morning";
    }
    // Afternoon: 12:00 PM – 4:59 PM (hours 12 to 16)
    if (hour >= 12 && hour < 17) {
        return "afternoon";
    }
    // Evening: 5:00 PM – 8:59 PM (hours 17 to 20)
    if (hour >= 17 && hour < 21) {
        return "evening";
    }
    // Night: 9:00 PM – 4:59 AM (hours 21 to 23 and 0 to 4)
    return "night";
}

function updateWelcomeGreeting(force = false) {
    const period = determineCurrentTimePeriod();
    if (!force && period === lastGreetingPeriod) return;
    lastGreetingPeriod = period;

    const data = TIME_GREETINGS[period];
    const headingEl = document.getElementById("welcomeHeading");
    const messageEl = document.getElementById("welcomeMessage");
    const tagEl = document.getElementById("greetingPeriodTag");

    if (headingEl && messageEl) {
        // Smooth text fade transition
        headingEl.style.opacity = "0.2";
        messageEl.style.opacity = "0.2";

        setTimeout(() => {
            headingEl.textContent = data.headline;
            messageEl.textContent = data.submessage;
            if (tagEl) tagEl.textContent = data.tag;
            headingEl.style.opacity = "1";
            messageEl.style.opacity = "1";
        }, 180);
    }
}

// Periodically evaluate local time to seamlessly transition when an hour threshold is crossed
setInterval(() => updateWelcomeGreeting(false), 30000);
updateWelcomeGreeting(true);

/* ========================================================
   3. DANCING FROG MASCOT CONTROLLER & CHROMA-KEY CUTOUT
   ======================================================== */
const mascotStage = document.getElementById("mascotStage");
const mascotContainer = document.getElementById("mascotContainer");
const mascotSpeech = document.getElementById("mascotSpeech");
const danceActionBtn = document.getElementById("danceActionBtn");
const danceBtnText = document.getElementById("danceBtnText");

let danceTimeoutId = null;
let speechTimeoutId = null;

/**
 * High-performance client-side Chroma Key Background Remover:
 * Cleans the solid orange studio background from the frog graphic so
 * it floats naturally and transparently above the dashboard.
 */
function initMascotChromaKey() {
    const img = document.getElementById("mascotImg");
    const canvas = document.getElementById("mascotCanvas");
    if (!img || !canvas) return;

    function processCutout() {
        try {
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            const w = img.naturalWidth || img.width || 220;
            const h = img.naturalHeight || img.height || 340;
            canvas.width = w;
            canvas.height = h;

            ctx.drawImage(img, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;

            // Sample corner pixels to detect exact background orange
            const cornerSamples = [
                [3, 3], [w - 4, 3], [3, Math.floor(h * 0.15)], [w - 4, Math.floor(h * 0.15)]
            ];
            let avgR = 0, avgG = 0, avgB = 0;
            cornerSamples.forEach(([x, y]) => {
                const idx = (y * w + x) * 4;
                avgR += data[idx];
                avgG += data[idx + 1];
                avgB += data[idx + 2];
            });
            avgR /= cornerSamples.length;
            avgG /= cornerSamples.length;
            avgB /= cornerSamples.length;

            // Orange range detector
            const isTargetOrange = (r, g, b) => {
                const diff = Math.sqrt(
                    Math.pow(r - avgR, 2) + 
                    Math.pow(g - avgG, 2) * 1.2 + 
                    Math.pow(b - avgB, 2) * 1.5
                );
                const isVibrantOrange = r > 175 && g >= 50 && g <= 165 && b < 70 && (r - g) > 40;
                return diff < 65 || (isVibrantOrange && diff < 90);
            };

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                if (isTargetOrange(r, g, b)) {
                    data[i + 3] = 0; // Transparent
                }
            }

            ctx.putImageData(imgData, 0, 0);
            canvas.style.display = "block";
            img.style.display = "none";
        } catch (e) {
            // Graceful fallback: display the original graphic in its glassmorphic frame
            console.warn("Mascot canvas transparency fallback enabled:", e.message);
            canvas.style.display = "none";
            img.style.display = "block";
        }
    }

    if (img.complete && img.naturalWidth > 0) {
        processCutout();
    } else {
        img.onload = processCutout;
        img.onerror = () => {
            // Check fallback asset locations
            const fallbacks = ["images/frog.png", "images/mascot.png", "images/frog-mascot.png", "frog.jpg"];
            let idx = 0;
            function tryNext() {
                if (idx < fallbacks.length) {
                    img.src = fallbacks[idx++];
                }
            }
            tryNext();
        };
    }
}

function showMascotSpeech(text, durationMs = 3800) {
    if (!mascotSpeech) return;
    if (speechTimeoutId) clearTimeout(speechTimeoutId);

    mascotSpeech.textContent = text;
    mascotSpeech.classList.add("visible");

    speechTimeoutId = setTimeout(() => {
        mascotSpeech.classList.remove("visible");
    }, durationMs);
}

function triggerMascotDance(durationMs = 6000, speechLine = null) {
    if (!mascotStage) return;

    if (danceTimeoutId) clearTimeout(danceTimeoutId);

    // Switch to active energetic dance mode
    mascotStage.classList.remove("idle");
    mascotStage.classList.add("dancing");

    if (danceActionBtn) {
        danceActionBtn.classList.add("active");
        if (danceBtnText) danceBtnText.textContent = "Grooving! 🎶";
    }

    // Pick speech quote
    const currentPeriod = determineCurrentTimePeriod();
    const periodQuotes = TIME_GREETINGS[currentPeriod].quotes;
    const randomQuote = speechLine || periodQuotes[Math.floor(Math.random() * periodQuotes.length)];
    showMascotSpeech(randomQuote, 4000);

    // Transition back smoothly to subtle idle animation after duration
    danceTimeoutId = setTimeout(() => {
        mascotStage.classList.remove("dancing");
        mascotStage.classList.add("idle");
        if (danceActionBtn) {
            danceActionBtn.classList.remove("active");
            if (danceBtnText) danceBtnText.textContent = "Dance!";
        }
    }, durationMs);
}

// Initial 6-second celebratory welcome dance on page startup
function setupMascotLifecycle() {
    initMascotChromaKey();

    // Initial energetic dance for ~6.5 seconds, then transition to idle
    triggerMascotDance(6500);

    // Interactive triggers: click or press Enter on the mascot
    if (mascotContainer) {
        mascotContainer.addEventListener("click", () => {
            triggerMascotDance(5000);
        });
        mascotContainer.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerMascotDance(5000);
            }
        });
    }

    // Action button
    if (danceActionBtn) {
        danceActionBtn.addEventListener("click", () => {
            triggerMascotDance(5000);
        });
    }
}

/* ========================================================
   4. VIBRANT PHOTOGRAPHIC BACKGROUND CONTROLLER
   ======================================================== */
const WEATHER_BACKGROUNDS = {
    Clear: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85",
    Clouds: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=85",
    Rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=85",
    Drizzle: "https://images.unsplash.com/photo-1541919329513-35f7af297129?auto=format&fit=crop&w=2000&q=85",
    Thunderstorm: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=2000&q=85",
    Snow: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=2000&q=85",
    Mist: "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2000&q=85",
    Fog: "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2000&q=85",
    Haze: "https://images.unsplash.com/photo-1532178910-7815d6919875?auto=format&fit=crop&w=2000&q=85",
    Night: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=2000&q=85",
    Default: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85"
};

let currentActiveBgLayer = 1;
let lastAppliedBgCondition = "";

function setDynamicBackground(weatherCondition, isNight = false) {
    let conditionKey = weatherCondition;
    if (isNight && (weatherCondition === "Clear" || weatherCondition === "Clouds")) {
        conditionKey = "Night";
    }
    if (!WEATHER_BACKGROUNDS[conditionKey]) conditionKey = "Default";
    if (conditionKey === lastAppliedBgCondition) return;
    lastAppliedBgCondition = conditionKey;

    const targetUrl = WEATHER_BACKGROUNDS[conditionKey];
    const layer1 = document.getElementById("bgLayer1");
    const layer2 = document.getElementById("bgLayer2");

    const incomingLayer = currentActiveBgLayer === 1 ? layer2 : layer1;
    const outgoingLayer = currentActiveBgLayer === 1 ? layer1 : layer2;

    const img = new Image();
    img.src = targetUrl;
    img.onload = () => {
        incomingLayer.style.backgroundImage = `url('${targetUrl}')`;
        incomingLayer.classList.add("active");
        outgoingLayer.classList.remove("active");
        currentActiveBgLayer = currentActiveBgLayer === 1 ? 2 : 1;
    };
    img.onerror = () => {
        incomingLayer.style.backgroundImage = `url('${WEATHER_BACKGROUNDS.Default}')`;
        incomingLayer.classList.add("active");
        outgoingLayer.classList.remove("active");
    };
}

/* ========================================================
   5. WEATHER CONTROLLER
   ======================================================== */
const apiKey = "cb7a687ff582ea01cad2e902acabc6e7";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?";
const forecastApiUrl = "https://api.openweathermap.org/data/2.5/forecast?";
const airPollutionApiUrl = "https://api.openweathermap.org/data/2.5/air_pollution?";

const searchBox = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const unitToggleBtn = document.getElementById("unitToggle");
const weatherIcon = document.getElementById("mainWeatherIcon");
const weatherContent = document.getElementById("weatherContent");
const weatherErrorDiv = document.getElementById("weatherError");
const errorMessage = document.getElementById("errorMessage");
const loadingDiv = document.getElementById("loadingIndicator");
const tempDisplay = document.getElementById("tempDisplay");
const cityNameDisplay = document.getElementById("cityNameDisplay");
const conditionBadge = document.getElementById("conditionBadge");
const tempRangeEl = document.getElementById("tempRange");
const feelsLikeEl = document.getElementById("feelsLike");
const humidityDisplay = document.getElementById("humidityDisplay");
const windDisplay = document.getElementById("windDisplay");
const aqiValueEl = document.getElementById("aqiValue");
const sunriseTimeEl = document.getElementById("sunriseTime");
const sunsetTimeEl = document.getElementById("sunsetTime");
const forecastGridEl = document.getElementById("forecastGrid");
const locationStatusEl = document.getElementById("locationStatus");

let currentUnit = "metric";
let lastQuery = { type: "city", value: "Kampala" };

const WEATHER_ICONS = {
    Clear: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='14' fill='%23fbbf24'/><g stroke='%23fbbf24' stroke-width='4' stroke-linecap='round'><line x1='32' y1='6' x2='32' y2='12'/><line x1='32' y1='52' x2='32' y2='58'/><line x1='6' y1='32' x2='12' y2='32'/><line x1='52' y1='32' x2='58' y2='32'/><line x1='13.6' y1='13.6' x2='17.8' y2='17.8'/><line x1='46.2' y1='46.2' x2='50.4' y2='50.4'/><line x1='13.6' y1='50.4' x2='17.8' y2='46.2'/><line x1='46.2' y1='17.8' x2='50.4' y2='13.6'/></g></svg>",
    Clouds: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M46 44H20a12 12 0 0 1-2.4-23.8A15 15 0 0 1 45 22.4 11 11 0 0 1 46 44z' fill='%23cbd5e1' stroke='%2394a3b8' stroke-width='2'/></svg>",
    Rain: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M46 38H20a10 10 0 0 1-2-19.8A13 13 0 0 1 45 20 9 9 0 0 1 46 38z' fill='%2394a3b8'/><g stroke='%2338bdf8' stroke-width='3' stroke-linecap='round'><line x1='22' y1='44' x2='18' y2='52'/><line x1='32' y1='44' x2='28' y2='52'/><line x1='42' y1='44' x2='38' y2='52'/></g></svg>",
    Drizzle: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M46 38H20a10 10 0 0 1-2-19.8A13 13 0 0 1 45 20 9 9 0 0 1 46 38z' fill='%2394a3b8'/><g stroke='%237dd3fc' stroke-width='2.5' stroke-linecap='round' stroke-dasharray='1 4'><line x1='24' y1='44' x2='22' y2='50'/><line x1='34' y1='44' x2='32' y2='50'/><line x1='44' y1='44' x2='42' y2='50'/></g></svg>",
    Thunderstorm: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M46 36H20a10 10 0 0 1-2-19.8A13 13 0 0 1 45 18 9 9 0 0 1 46 36z' fill='%2364748b'/><polygon points='30,38 24,48 31,48 27,58 38,46 32,46' fill='%23fbbf24'/></svg>",
    Snow: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><path d='M46 36H20a10 10 0 0 1-2-19.8A13 13 0 0 1 45 18 9 9 0 0 1 46 36z' fill='%2394a3b8'/><g fill='%23ffffff'><circle cx='22' cy='46' r='2'/><circle cx='32' cy='46' r='2'/><circle cx='42' cy='46' r='2'/><circle cx='27' cy='52' r='2'/><circle cx='37' cy='52' r='2'/></g></svg>",
    Mist: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g stroke='%23cbd5e1' stroke-width='3' stroke-linecap='round'><line x1='16' y1='26' x2='48' y2='26'/><line x1='12' y1='34' x2='52' y2='34'/><line x1='18' y1='42' x2='46' y2='42'/></g></svg>"
};

function getWeatherIcon(mainCondition) {
    const localMap = {
        Clear: "images/clear-sun.svg",
        Clouds: "images/clouds.svg",
        Rain: "images/rain.svg",
        Drizzle: "images/drizzle.svg",
        Mist: "images/mist.svg",
        Smoke: "images/mist.svg",
        Haze: "images/mist.svg",
        Fog: "images/mist.svg",
        Snow: "images/snow.svg"
    };

    const fallback = WEATHER_ICONS[mainCondition] || WEATHER_ICONS.Clouds;
    return {
        primary: localMap[mainCondition] || fallback,
        fallback: fallback
    };
}

function getAqiBadge(index) {
    switch(index) {
        case 1: return `<span class="aqi-pill aqi-good">Good</span>`;
        case 2: return `<span class="aqi-pill aqi-fair">Fair</span>`;
        case 3: return `<span class="aqi-pill aqi-moderate">Moderate</span>`;
        case 4: return `<span class="aqi-pill aqi-poor">Poor</span>`;
        case 5: return `<span class="aqi-pill aqi-vpoor">Very Poor</span>`;
        default: return `<span class="aqi-pill">N/A</span>`;
    }
}

function formatTime(unixSeconds, timezoneOffsetSeconds) {
    const date = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function setWeatherLoading(isLoading) {
    loadingDiv.style.display = isLoading ? "block" : "none";
    if (isLoading) weatherErrorDiv.style.display = "none";
}

async function checkWeather(city) {
    if (!city || !city.trim()) return;
    lastQuery = { type: "city", value: city.trim() };
    const queryUrl = `${weatherApiUrl}units=${currentUnit}&q=${encodeURIComponent(city.trim())}&appid=${apiKey}`;
    await executeWeatherFetch(queryUrl);
}

async function checkWeatherByCoords(lat, lon) {
    lastQuery = { type: "coords", lat: lat, lon: lon };
    const queryUrl = `${weatherApiUrl}units=${currentUnit}&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    await executeWeatherFetch(queryUrl);
}

async function executeWeatherFetch(queryUrl) {
    setWeatherLoading(true);
    try {
        const response = await fetch(queryUrl);
        if (!response.ok) {
            if (response.status === 404) {
                showWeatherError("City not found. Please verify spelling.");
            } else {
                showWeatherError("Weather service unavailable right now.");
            }
            return;
        }

        const data = await response.json();
        renderCurrentWeather(data);

        await Promise.allSettled([
            fetchForecast(data.coord.lat, data.coord.lon),
            fetchAirQuality(data.coord.lat, data.coord.lon)
        ]);

        weatherErrorDiv.style.display = "none";
        weatherContent.style.display = "block";
    } catch (err) {
        showWeatherError("Network error. Please check your internet connection.");
    } finally {
        setWeatherLoading(false);
    }
}

function renderCurrentWeather(data) {
    const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
    const speedSymbol = currentUnit === "metric" ? "km/h" : "mph";

    cityNameDisplay.textContent = `${data.name}, ${data.sys.country || ""}`;
    tempDisplay.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
    humidityDisplay.textContent = `${data.main.humidity}%`;
    windDisplay.textContent = `${Math.round(data.wind.speed)} ${speedSymbol}`;

    const mainCondition = data.weather && data.weather[0] ? data.weather[0].main : "Clear";
    const desc = data.weather && data.weather[0] ? data.weather[0].description : "";
    conditionBadge.textContent = desc || mainCondition;

    const nowSec = Math.floor(Date.now() / 1000);
    const isNight = data.sys.sunset && (nowSec > data.sys.sunset || nowSec < data.sys.sunrise);

    setDynamicBackground(mainCondition, isNight);

    const iconConfig = getWeatherIcon(mainCondition);
    weatherIcon.src = iconConfig.primary;
    weatherIcon.onerror = () => { weatherIcon.src = iconConfig.fallback; };

    feelsLikeEl.textContent = `Feels like ${Math.round(data.main.feels_like)}${unitSymbol}`;
    tempRangeEl.textContent = `H: ${Math.round(data.main.temp_max)}${unitSymbol}  L: ${Math.round(data.main.temp_min)}${unitSymbol}`;

    const offset = data.timezone || 0;
    sunriseTimeEl.textContent = formatTime(data.sys.sunrise, offset);
    sunsetTimeEl.textContent = formatTime(data.sys.sunset, offset);
    locationStatusEl.textContent = data.name;
}

async function fetchForecast(lat, lon) {
    try {
        const res = await fetch(`${forecastApiUrl}units=${currentUnit}&lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (!res.ok) return;
        const forecastData = await res.json();
        renderForecast(forecastData.list);
    } catch (e) {
        console.error("Forecast error:", e);
    }
}

function renderForecast(forecastList) {
    forecastGridEl.innerHTML = "";
    const dailyData = {};

    forecastList.forEach(entry => {
        const dateKey = entry.dt_txt.split(" ")[0];
        if (!dailyData[dateKey]) dailyData[dateKey] = [];
        dailyData[dateKey].push(entry);
    });

    const days = Object.keys(dailyData).slice(0, 5);

    days.forEach(day => {
        const entries = dailyData[day];
        const midEntry = entries.find(e => e.dt_txt.includes("12:00:00")) || entries[Math.floor(entries.length / 2)];

        let minTemp = Infinity;
        let maxTemp = -Infinity;
        entries.forEach(e => {
            if (e.main.temp_min < minTemp) minTemp = e.main.temp_min;
            if (e.main.temp_max > maxTemp) maxTemp = e.main.temp_max;
        });

        const dateObj = new Date(day);
        const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
        const mainCond = midEntry.weather[0].main;
        const iconConfig = getWeatherIcon(mainCond);

        const item = document.createElement("div");
        item.className = "forecast-item";
        item.innerHTML = `
            <p class="f-day">${dayName}</p>
            <div class="f-icon-wrap">
                <img src="${iconConfig.primary}" alt="${mainCond}" class="f-icon" onerror="this.src='${iconConfig.fallback}'">
            </div>
            <p class="f-condition" title="${mainCond}">${mainCond}</p>
            <p class="f-temps">
                <span class="f-max">${Math.round(maxTemp)}°</span>
                <span class="f-min">${Math.round(minTemp)}°</span>
            </p>
        `;
        forecastGridEl.appendChild(item);
    });
}

async function fetchAirQuality(lat, lon) {
    try {
        const res = await fetch(`${airPollutionApiUrl}lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (!res.ok) {
            aqiValueEl.innerHTML = `<span class="aqi-pill">N/A</span>`;
            return;
        }
        const aqiData = await res.json();
        if (aqiData.list && aqiData.list[0]) {
            aqiValueEl.innerHTML = getAqiBadge(aqiData.list[0].main.aqi);
        }
    } catch (e) {
        aqiValueEl.innerHTML = `<span class="aqi-pill">N/A</span>`;
    }
}

function showWeatherError(msg) {
    errorMessage.textContent = msg;
    weatherErrorDiv.style.display = "block";
    weatherContent.style.display = "none";
}

searchBtn.addEventListener("click", () => checkWeather(searchBox.value));
searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkWeather(searchBox.value);
});

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showWeatherError("Geolocation is not supported by your browser.");
        return;
    }
    setWeatherLoading(true);
    locationStatusEl.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
        (pos) => checkWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        (err) => {
            setWeatherLoading(false);
            let errText = "Unable to retrieve your location.";
            if (err.code === 1) errText = "Location permission denied. Please allow location access or type city name.";
            showWeatherError(errText);
            locationStatusEl.textContent = "Weather";
        },
        { timeout: 10000, enableHighAccuracy: false }
    );
});

unitToggleBtn.addEventListener("click", () => {
    if (currentUnit === "metric") {
        currentUnit = "imperial";
        unitToggleBtn.textContent = "°C";
    } else {
        currentUnit = "metric";
        unitToggleBtn.textContent = "°F";
    }
    if (lastQuery.type === "city" && lastQuery.value) checkWeather(lastQuery.value);
    else if (lastQuery.type === "coords") checkWeatherByCoords(lastQuery.lat, lastQuery.lon);
});

/* ========================================================
   6. CURRENCY & CRYPTOCURRENCY CONVERTER CONTROLLER
   ======================================================== */
const fiatApiBase = "https://open.er-api.com/v6/latest/";
const amountInput = document.getElementById("currencyAmount");
const fromSelect = document.getElementById("fromCurrency");
const toSelect = document.getElementById("toCurrency");
const swapBtn = document.getElementById("swapCurrenciesBtn");
const refreshRatesBtn = document.getElementById("refreshRatesBtn");
const resultFormula = document.getElementById("resultFormula");
const resultTotal = document.getElementById("resultTotal");
const rateStatus = document.getElementById("rateStatus");
const popularPairsGrid = document.getElementById("popularPairsGrid");

const btcUsdEl = document.getElementById("btcUsdPrice");
const btcUgxEl = document.getElementById("btcUgxPrice");
const btcChangePill = document.getElementById("btcChangePill");
const ethUsdEl = document.getElementById("ethUsdPrice");
const ethUgxEl = document.getElementById("ethUgxPrice");
const ethChangePill = document.getElementById("ethChangePill");
const cryptoPulseText = document.getElementById("cryptoPulseText");
const cardBtc = document.getElementById("cardBtc");
const cardEth = document.getElementById("cardEth");

let cachedFiatRates = null;
let cachedCryptoRates = null;

const CRYPTO_KEYS = ["BTC", "ETH"];

function isCrypto(code) {
    return CRYPTO_KEYS.includes(code.toUpperCase());
}

async function fetchFiatRates(forceRefresh = false) {
    const cacheKey = "forin_fiat_rates_v2";
    const cached = localStorage.getItem(cacheKey);

    if (!forceRefresh && cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 6 * 3600 * 1000) {
                cachedFiatRates = parsed.data;
                return;
            }
        } catch(e) {}
    }

    try {
        const res = await fetch(`${fiatApiBase}USD`);
        if (!res.ok) throw new Error("Fiat service error");
        const data = await res.json();
        if (data.result === "success") {
            cachedFiatRates = data;
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        }
    } catch (err) {
        console.warn("Fiat rates fetch error, checking cached backup:", err);
    }
}

async function fetchCryptoRates(forceRefresh = false) {
    const cacheKey = "forin_crypto_rates_v2";
    const cached = localStorage.getItem(cacheKey);

    if (!forceRefresh && cached) {
        try {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 3 * 60 * 1000) {
                cachedCryptoRates = parsed.data;
                updateCryptoUI();
                return;
            }
        } catch(e) {}
    }

    // Primary: CoinGecko Simple Price
    try {
        const cgUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,ugx&include_24hr_change=true";
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(cgUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.bitcoin && data.ethereum) {
                cachedCryptoRates = {
                    BTC: {
                        usd: data.bitcoin.usd,
                        ugx: data.bitcoin.ugx,
                        change24h: data.bitcoin.usd_24h_change || 0
                    },
                    ETH: {
                        usd: data.ethereum.usd,
                        ugx: data.ethereum.ugx,
                        change24h: data.ethereum.usd_24h_change || 0
                    },
                    source: "CoinGecko",
                    updatedAt: Date.now()
                };
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: cachedCryptoRates
                }));
                updateCryptoUI();
                return;
            }
        }
    } catch (err) {
        console.warn("CoinGecko rate query failed, attempting Coinbase fallback:", err.message);
    }

    // Secondary: Coinbase Exchange Ticker
    try {
        const [btcCb, ethCb] = await Promise.all([
            fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot").then(r => r.json()),
            fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot").then(r => r.json())
        ]);

        const btcUsd = parseFloat(btcCb.data.amount);
        const ethUsd = parseFloat(ethCb.data.amount);
        const usdUgx = (cachedFiatRates && cachedFiatRates.rates && cachedFiatRates.rates.UGX) ? cachedFiatRates.rates.UGX : 3800;

        cachedCryptoRates = {
            BTC: {
                usd: btcUsd,
                ugx: btcUsd * usdUgx,
                change24h: 0
            },
            ETH: {
                usd: ethUsd,
                ugx: ethUsd * usdUgx,
                change24h: 0
            },
            source: "Coinbase",
            updatedAt: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: cachedCryptoRates
        }));
        updateCryptoUI();
    } catch (fallbackErr) {
        console.error("All crypto APIs temporarily unavailable:", fallbackErr);
    }
}

function updateCryptoUI() {
    if (!cachedCryptoRates) return;

    const btc = cachedCryptoRates.BTC;
    const eth = cachedCryptoRates.ETH;

    if (btc) {
        btcUsdEl.textContent = `$${formatCurrencyNumber(btc.usd, true)}`;
        btcUgxEl.textContent = `≈ ${formatUgxNumber(btc.ugx)} UGX`;
        renderChangePill(btcChangePill, btc.change24h);
    }

    if (eth) {
        ethUsdEl.textContent = `$${formatCurrencyNumber(eth.usd, true)}`;
        ethUgxEl.textContent = `≈ ${formatUgxNumber(eth.ugx)} UGX`;
        renderChangePill(ethChangePill, eth.change24h);
    }

    cryptoPulseText.textContent = `Live (${cachedCryptoRates.source || "Spot"})`;
}

function renderChangePill(element, changeVal) {
    if (!element) return;
    const val = parseFloat(changeVal);
    if (isNaN(val) || val === 0) {
        element.className = "crypto-change-pill neutral";
        element.textContent = "0.0%";
    } else if (val > 0) {
        element.className = "crypto-change-pill positive";
        element.textContent = `+${val.toFixed(2)}%`;
    } else {
        element.className = "crypto-change-pill negative";
        element.textContent = `${val.toFixed(2)}%`;
    }
}

function calculateUniversalRate(from, to) {
    const fromIsCrypto = isCrypto(from);
    const toIsCrypto = isCrypto(to);

    // Fiat to Fiat
    if (!fromIsCrypto && !toIsCrypto) {
        if (!cachedFiatRates || !cachedFiatRates.rates) return null;
        const rates = cachedFiatRates.rates;
        if (!rates[from] || !rates[to]) return null;
        return (1 / rates[from]) * rates[to];
    }

    // Crypto to Crypto
    if (fromIsCrypto && toIsCrypto) {
        if (from === to) return 1;
        if (!cachedCryptoRates || !cachedCryptoRates[from] || !cachedCryptoRates[to]) return null;
        return cachedCryptoRates[from].usd / cachedCryptoRates[to].usd;
    }

    // Crypto to Fiat
    if (fromIsCrypto && !toIsCrypto) {
        if (!cachedCryptoRates || !cachedCryptoRates[from]) return null;
        const cryptoUsd = cachedCryptoRates[from].usd;
        if (to === "USD") return cryptoUsd;
        if (!cachedFiatRates || !cachedFiatRates.rates || !cachedFiatRates.rates[to]) return null;
        return cryptoUsd * cachedFiatRates.rates[to];
    }

    // Fiat to Crypto
    if (!fromIsCrypto && toIsCrypto) {
        if (!cachedCryptoRates || !cachedCryptoRates[to]) return null;
        const cryptoUsd = cachedCryptoRates[to].usd;
        if (from === "USD") return 1 / cryptoUsd;
        if (!cachedFiatRates || !cachedFiatRates.rates || !cachedFiatRates.rates[from]) return null;
        const fiatInUsd = 1 / cachedFiatRates.rates[from];
        return fiatInUsd / cryptoUsd;
    }

    return null;
}

function formatCurrencyNumber(val, isFiatUsd = false) {
    if (val === null || val === undefined || isNaN(val)) return "--";
    if (val >= 1000) {
        return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (val >= 1) {
        return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else if (val >= 0.0001) {
        return val.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
    } else {
        return val.toLocaleString("en-US", { minimumFractionDigits: 6, maximumFractionDigits: 8 });
    }
}

function formatUgxNumber(val) {
    if (!val || isNaN(val)) return "--";
    return Math.round(val).toLocaleString("en-US");
}

function updateConversionUI() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const rawAmount = parseFloat(amountInput.value);
    const amount = isNaN(rawAmount) ? 0 : rawAmount;

    const rate = calculateUniversalRate(from, to);

    if (!rate) {
        resultFormula.textContent = `Pair ${from}/${to} unavailable`;
        resultTotal.textContent = "--";
        return;
    }

    const total = amount * rate;
    const formattedRate = formatCurrencyNumber(rate);
    const formattedTotal = formatCurrencyNumber(total);

    resultFormula.textContent = `1 ${from} = ${formattedRate} ${to}`;
    resultTotal.textContent = `${formattedTotal} ${to}`;

    let timeLabel = "Live Market";
    if (cachedFiatRates && cachedFiatRates.time_last_update_utc) {
        timeLabel = cachedFiatRates.time_last_update_utc.substring(0, 16) + " UTC";
    }
    rateStatus.textContent = `Updated: ${timeLabel} • Spot mid-market`;
}

function renderPopularPairs() {
    popularPairsGrid.innerHTML = "";

    const pairs = [
        { from: "BTC", to: "USD" },
        { from: "BTC", to: "UGX" },
        { from: "ETH", to: "USD" },
        { from: "USD", to: "UGX" },
        { from: "EUR", to: "UGX" },
        { from: "USD", to: "KES" }
    ];

    pairs.forEach(pair => {
        const rate = calculateUniversalRate(pair.from, pair.to);
        if (!rate) return;

        const item = document.createElement("div");
        item.className = "pair-item";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.title = `Switch converter to ${pair.from} → ${pair.to}`;
        item.innerHTML = `
            <div class="pair-names">${pair.from} / ${pair.to}</div>
            <div class="pair-rate">${formatCurrencyNumber(rate)}</div>
        `;
        const applyPair = () => {
            fromSelect.value = pair.from;
            toSelect.value = pair.to;
            updateConversionUI();
        };
        item.addEventListener("click", applyPair);
        item.addEventListener("keydown", (e) => { if (e.key === "Enter") applyPair(); });
        popularPairsGrid.appendChild(item);
    });
}

async function refreshAllRates(force = false) {
    refreshRatesBtn.classList.add("rotating");
    rateStatus.textContent = "Updating fiat & crypto rates...";

    await Promise.allSettled([
        fetchFiatRates(force),
        fetchCryptoRates(force)
    ]);

    updateConversionUI();
    renderPopularPairs();
    refreshRatesBtn.classList.remove("rotating");
}

if (cardBtc) {
    cardBtc.addEventListener("click", () => {
        fromSelect.value = "BTC";
        toSelect.value = "UGX";
        updateConversionUI();
    });
}
if (cardEth) {
    cardEth.addEventListener("click", () => {
        fromSelect.value = "ETH";
        toSelect.value = "UGX";
        updateConversionUI();
    });
}

amountInput.addEventListener("input", updateConversionUI);
fromSelect.addEventListener("change", updateConversionUI);
toSelect.addEventListener("change", updateConversionUI);

swapBtn.addEventListener("click", () => {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    updateConversionUI();
});

refreshRatesBtn.addEventListener("click", () => refreshAllRates(true));

/* ========================================================
   7. RESILIENT MULTI-SOURCE NEWS CONTROLLER
   ======================================================== */
const newsListEl = document.getElementById("newsList");
const refreshNewsBtn = document.getElementById("refreshNewsBtn");
const categoryButtons = document.querySelectorAll(".news-chip");

const NEWS_FEEDS = {
    general: [
        { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC World" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", source: "NY Times" },
        { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera" }
    ],
    business: [
        { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", source: "NY Times" },
        { url: "https://feeds.npr.org/1006/rss.xml", source: "NPR Business" }
    ],
    technology: [
        { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC Tech" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml", source: "NY Times" },
        { url: "https://techcrunch.com/feed/", source: "TechCrunch" }
    ],
    sport: [
        { url: "https://feeds.bbci.co.uk/sport/rss.xml", source: "BBC Sport" },
        { url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml", source: "NY Times" },
        { url: "https://www.espn.com/espn/rss/news", source: "ESPN" }
    ]
};

const CATEGORY_FALLBACK_IMAGES = {
    general: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
    business: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"
};

let currentNewsCategory = "general";
let isNewsFetching = false;

function timeAgo(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (isNaN(diffInSeconds) || diffInSeconds < 0) return "Recently";
    if (diffInSeconds < 60) return "Just now";
    const mins = Math.floor(diffInSeconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function cleanSnippet(rawText) {
    if (!rawText) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = rawText;
    const clean = tmp.textContent || tmp.innerText || "";
    return clean.replace(/\s+/g, " ").trim();
}

function extractImage(item, category) {
    if (item.thumbnail && item.thumbnail.startsWith("http")) return item.thumbnail;
    if (item.enclosure && item.enclosure.link && item.enclosure.link.startsWith("http")) return item.enclosure.link;

    if (item.description) {
        const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (match && match[1] && match[1].startsWith("http")) return match[1];
    }

    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.general;
}

function renderNewsSkeletons() {
    newsListEl.innerHTML = `
        <div class="skeleton skeleton-hero"></div>
        <div class="news-subgrid">
            <div class="skeleton skeleton-grid-item"></div>
            <div class="skeleton skeleton-grid-item"></div>
            <div class="skeleton skeleton-grid-item"></div>
            <div class="skeleton skeleton-grid-item"></div>
        </div>
    `;
}

function parseXmlRss(xmlText, fallbackSource = "Global News") {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) throw new Error("Invalid RSS XML");

    const channelTitle = xmlDoc.querySelector("channel > title")?.textContent?.trim() || fallbackSource;
    const itemNodes = Array.from(xmlDoc.querySelectorAll("item"));

    return itemNodes.map(node => {
        const title = node.querySelector("title")?.textContent?.trim() || "Untitled Story";
        let link = node.querySelector("link")?.textContent?.trim();
        if (!link) link = node.querySelector("guid")?.textContent?.trim() || "#";

        const description = node.querySelector("description")?.textContent?.trim() || 
                            node.querySelector("summary")?.textContent?.trim() || "";
        const pubDate = node.querySelector("pubDate")?.textContent?.trim() || 
                        node.querySelector("date")?.textContent?.trim() || "";
        const author = node.querySelector("author")?.textContent?.trim() || 
                       node.querySelector("dc\\:creator, creator")?.textContent?.trim() || 
                       channelTitle;

        let thumbnail = "";
        const mediaContent = node.querySelector("media\\:content, content");
        if (mediaContent && mediaContent.getAttribute("url")) {
            thumbnail = mediaContent.getAttribute("url");
        }
        if (!thumbnail) {
            const mediaThumb = node.querySelector("media\\:thumbnail, thumbnail");
            if (mediaThumb && mediaThumb.getAttribute("url")) {
                thumbnail = mediaThumb.getAttribute("url");
            }
        }
        if (!thumbnail) {
            const enclosure = node.querySelector("enclosure[type^='image']");
            if (enclosure && enclosure.getAttribute("url")) {
                thumbnail = enclosure.getAttribute("url");
            }
        }
        if (!thumbnail && description) {
            const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch && imgMatch[1]) thumbnail = imgMatch[1];
        }

        return { title, link, description, pubDate, author, thumbnail };
    });
}

async function fetchFeedWithFallbacks(feedObj) {
    const targetUrl = feedObj.url;
    const defaultSource = feedObj.source;

    // Tier 1: RSS2JSON Converter
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        const r2jUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(r2jUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.status === "ok" && Array.isArray(data.items) && data.items.length > 0) {
                return data.items.map(item => ({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate,
                    author: item.author || defaultSource,
                    thumbnail: item.thumbnail || (item.enclosure && item.enclosure.link) || ""
                }));
            }
        }
    } catch (err) {
        console.warn(`rss2json attempt failed for ${defaultSource}, switching to CORS XML proxies:`, err.message);
    }

    // Tier 2: Public CORS proxies with XML parser
    const corsProxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    for (const proxyUrl of corsProxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (res.ok) {
                const xmlText = await res.text();
                const parsedItems = parseXmlRss(xmlText, defaultSource);
                if (parsedItems && parsedItems.length > 0) {
                    return parsedItems;
                }
            }
        } catch (e) {
            // Try next proxy
        }
    }

    throw new Error(`Unable to load feed from ${defaultSource}`);
}

async function fetchNews(category = "general", forceRefresh = false) {
    if (isNewsFetching) return;
    isNewsFetching = true;
    currentNewsCategory = category;
    const cacheKey = `forin_news_${category}_v3`;

    if (!forceRefresh) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
                    renderNews(parsed.items, category, false);
                    isNewsFetching = false;
                    return;
                }
            } catch(e) {}
        }
    }

    renderNewsSkeletons();
    refreshNewsBtn.classList.add("rotating");

    const feedsToTry = NEWS_FEEDS[category] || NEWS_FEEDS.general;
    let loadedStories = null;

    for (const feedConfig of feedsToTry) {
        try {
            const items = await fetchFeedWithFallbacks(feedConfig);
            if (items && items.length > 0) {
                loadedStories = items;
                break;
            }
        } catch (feedErr) {
            console.warn(`Feed ${feedConfig.source} failed, attempting backup provider.`);
        }
    }

    if (loadedStories && loadedStories.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            items: loadedStories
        }));
        renderNews(loadedStories, category, false);
    } else {
        const backup = localStorage.getItem(cacheKey);
        if (backup) {
            try {
                const parsed = JSON.parse(backup);
                renderNews(parsed.items, category, true, parsed.timestamp);
            } catch(e) {
                renderNewsError();
            }
        } else {
            renderNewsError();
        }
    }

    refreshNewsBtn.classList.remove("rotating");
    isNewsFetching = false;
}

function renderNews(items, category, isOffline = false, cachedTimestamp = null) {
    newsListEl.innerHTML = "";

    if (isOffline) {
        const notice = document.createElement("div");
        notice.className = "news-offline-notice";
        const timeLabel = cachedTimestamp ? timeAgo(new Date(cachedTimestamp)) : "earlier";
        notice.innerHTML = `
            <span>Offline Archive • Stories cached ${timeLabel}</span>
            <button onclick="fetchNews('${category}', true)" class="news-retry-pill">Retry</button>
        `;
        newsListEl.appendChild(notice);
    }

    if (!items || items.length === 0) {
        renderNewsError();
        return;
    }

    const stories = items.slice(0, 5);
    const featuredStory = stories[0];
    const secondaryStories = stories.slice(1);

    // Featured Hero Card
    const featuredImg = extractImage(featuredStory, category);
    const featuredSnippet = cleanSnippet(featuredStory.description);

    const heroCard = document.createElement("a");
    heroCard.className = "featured-news-card";
    heroCard.href = featuredStory.link;
    heroCard.target = "_blank";
    heroCard.rel = "noopener noreferrer";
    heroCard.setAttribute("aria-label", `Featured Story: ${featuredStory.title}`);
    heroCard.innerHTML = `
        <img src="${featuredImg}" alt="" class="featured-bg-img" loading="lazy" onerror="this.src='${CATEGORY_FALLBACK_IMAGES[category]}'">
        <div class="featured-scrim"></div>
        <div class="featured-content">
            <span class="featured-badge">${category.toUpperCase()} • TOP STORY</span>
            <h4 class="featured-title">${escapeHTML(featuredStory.title)}</h4>
            ${featuredSnippet ? `<p class="featured-snippet">${escapeHTML(featuredSnippet)}</p>` : ""}
            <div class="featured-meta">
                <span class="news-source-badge">${escapeHTML(featuredStory.author || "News")}</span>
                <span>•</span>
                <span>${timeAgo(featuredStory.pubDate)}</span>
            </div>
        </div>
    `;
    newsListEl.appendChild(heroCard);

    // Supporting Grid Cards
    if (secondaryStories.length > 0) {
        const subGrid = document.createElement("div");
        subGrid.className = "news-subgrid";

        secondaryStories.forEach(story => {
            const thumb = extractImage(story, category);
            const snippet = cleanSnippet(story.description);

            const card = document.createElement("a");
            card.className = "news-card-item";
            card.href = story.link;
            card.target = "_blank";
            card.rel = "noopener noreferrer";
            card.setAttribute("aria-label", story.title);
            card.innerHTML = `
                <div class="news-thumb-wrapper">
                    <img src="${thumb}" alt="" class="news-thumb" loading="lazy" onerror="this.src='${CATEGORY_FALLBACK_IMAGES[category]}'">
                </div>
                <div class="news-card-body">
                    <h5 class="news-item-title">${escapeHTML(story.title)}</h5>
                    ${snippet ? `<p class="news-item-snippet">${escapeHTML(snippet)}</p>` : ""}
                    <div class="news-item-meta">
                        <span class="news-source-badge">${escapeHTML(story.author || "News")}</span>
                        <span>•</span>
                        <span>${timeAgo(story.pubDate)}</span>
                    </div>
                </div>
            `;
            subGrid.appendChild(card);
        });

        newsListEl.appendChild(subGrid);
    }
}

function renderNewsError() {
    const isOffline = !navigator.onLine;
    const message = isOffline 
        ? "You appear to be offline. Please verify your connection." 
        : "Unable to retrieve headlines right now. Tap below to retry.";

    newsListEl.innerHTML = `
        <div class="error" style="display:block; text-align:center; padding: 24px 16px;">
            <p style="margin-bottom:8px;">${message}</p>
            <button class="news-retry-btn" onclick="fetchNews('${currentNewsCategory}', true)">Try Again</button>
        </div>
    `;
}

function escapeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;
        categoryButtons.forEach(b => {
            b.classList.remove("active");
            b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        fetchNews(btn.dataset.category, false);
    });
});

refreshNewsBtn.addEventListener("click", () => fetchNews(currentNewsCategory, true));

/* ========================================================
   8. APPLICATION INITIALIZATION
   ======================================================== */
window.addEventListener("DOMContentLoaded", () => {
    setupMascotLifecycle();
    setDynamicBackground("Default");
    checkWeather("Kampala");
    refreshAllRates(false);
    fetchNews("general", false);

    // Auto-refresh crypto rates every 90 seconds
    setInterval(() => {
        fetchCryptoRates(true);
    }, 90000);
});