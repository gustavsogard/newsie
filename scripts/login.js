// Hvis brugeren er logget ind, bliver den sendt til forsiden
if (window.sessionStorage.getItem('userId') !== null) {
    window.location.replace('/');
}

window.addEventListener('DOMContentLoaded', () => {
    let formLogin = document.getElementById('login-form');

    // Når brugeren trykker på "Log ind", bliver brugerens oplysninger sammenlignet med de oplysninger, der er gemt i local storage
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();

        let email = document.getElementById('email').value;
        let password = btoa(document.getElementById('password').value);

        let allUsers = JSON.parse(window.localStorage.getItem('users'));

        let check = false;
        let userId;

        if (allUsers !== null) {
            for (let i = 0; i < allUsers.length; i++) {
                console.log(allUsers[i].email, allUsers[i].pass);
                if (allUsers[i].email === email && allUsers[i].pass === password) {
                    check = true;
                    userId = allUsers[i].id;
                }
            }
        }

        if (check) {
            window.sessionStorage.setItem('userId', userId);
            window.location.replace('/');
        } else {
            document.getElementById('alert-text').textContent = 'Forkert e-mail eller kodeord.';
        }
    })
})
