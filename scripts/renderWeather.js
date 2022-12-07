// Denne funktion henter vejrdata fra open-meteo.com og viser det på forsiden, både som i dag og for de næste 7 dage
export async function renderWeather(apikey) {
    const months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];

    const weatherData = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.6761&longitude=12.5683&daily=weathercode,temperature_2m_max,sunrise,sunset&timezone=Europe%2FBerlin&hourly=temperature_2m')
                                    .then(response => response.json())
                                    .then(result => {return result});
    let weatherIcon = document.getElementById('weatherIcon');
    let currentWeather = document.getElementById('currentWeather');
    let forecast = document.getElementById('forecast');

    let degrees;

    for (let i = 0; i <= 23; i++) {
        if ((new Date()).getHours() == weatherData.hourly.time[i].slice(-5, -3)) {
            degrees = Math.floor(weatherData.hourly.temperature_2m[i])
        }
    }

    let sunrise = weatherData.daily.sunrise[0].slice(-5);
    let sunset = weatherData.daily.sunset[0].slice(-5);

    let symbol;

    switch (weatherData.daily.weathercode[0]) {
        case 0:
            symbol = 'sunny';
            break;
        case 1:
        case 2:
        case 3:
            symbol = 'cloudy';
            break;
        case 45:
        case 48:
            symbol = 'foggy';
            break;
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            symbol = 'cloudy_snowing';
            break;
        case 95:
        case 96:
        case 99:
            symbol = 'thunderstorm';
            break;
        default:
            symbol = 'rainy';
    }

    currentWeather.textContent = degrees + '°';
    weatherIcon.textContent = symbol;
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;


    for (let i = 0; i < 7; i++) {
        let date = weatherData.daily.time[i].slice(-2);
        let month = months[weatherData.daily.time[i].slice(-5, -3) - 1].slice(0, 3).toLowerCase();
        let degrees = Math.floor(weatherData.daily.temperature_2m_max[i]);

        let symbol;

        switch (weatherData.daily.weathercode[i]) {
            case 0:
                symbol = 'sunny';
                break;
            case 1:
            case 2:
            case 3:
                symbol = 'cloudy';
                break;
            case 45:
            case 48:
                symbol = 'foggy';
                break;
            case 71:
            case 73:
            case 75:
            case 77:
            case 85:
            case 86:
                symbol = 'cloudy_snowing';
                break;
            case 95:
            case 96:
            case 99:
                symbol = 'thunderstorm';
                break;
            default:
                symbol = 'rainy';
        }

        forecast.innerHTML += `
        <div class="forecast-day">
            <p class="info-timestamp">${date}. ${month}</p>
            <span class="material-symbols-rounded weekday-forecast">${symbol}</span>
            <p class="h2">${degrees}°</p>
        </div>
        `;
    }
}
