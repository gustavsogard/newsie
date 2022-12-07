// Denne funktion opdaterer timestampet for applikationen ved load af forsiden
export function updateTimestamp() {
    let today = new Date();

    let hours = today.getHours() < 10 ? '0' + today.getHours(): today.getHours();
    let minutes = today.getMinutes() < 10 ? '0' + today.getMinutes(): today.getMinutes();
    let seconds = today.getSeconds() < 10 ? '0' + today.getSeconds(): today.getSeconds();

    document.getElementById('timestamp').textContent = `
        ${hours}:${minutes}:${seconds}
    `;
}

// Denne funktion opdaterer dagen og datoen for applikationen ved load af forsiden
export function updateDate() {
    let today = new Date();

    const weekdays = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    const months = ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"];
    let date = today.getDate();
    let day = weekdays[today.getDay()];
    let month = months[today.getMonth()];
    let year = today.getFullYear();

    document.getElementById('date').textContent = `${day}, ${date}. ${month} ${year}`;
}

export function updateTimezone() {
    let today = new Date();

    let timezone = 'UTC+' + Math.abs(today.getTimezoneOffset()/60);
    document.getElementById('timezone').textContent = timezone;
}