// Hvis brugeren er logget ind, bliver de sendt til forsiden
if (window.sessionStorage.getItem('userId') !== null) {
    window.location.replace('/');
}

window.addEventListener('DOMContentLoaded', () => {
    let formCreate = document.getElementById('create-form');

    // Når brugeren trykker på "Opret bruger", bliver brugerens oplysninger gemt i local storage og et nyt id genereres på baggrund af allerede eksisterende brugere
    formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        let email = document.getElementById('email').value;
        let fullName = document.getElementById('fullName').value;
        let password = btoa(document.getElementById('password').value);

        let allUsers = JSON.parse(window.localStorage.getItem('users'));

        let userId;
        let check = true;

        if (allUsers === null || allUsers == "") {
            userId = 1;
        } else {
            let allUsersIds = allUsers.map(el => {return el.id});
            userId = Math.max(...allUsersIds) + 1;
            
            for (let i = 0; i < allUsers.length; i++) {
                if (allUsers[i].email === email) {
                    check = false;
                }
            }
        }

        if (check) {
            const newCredentials = {
                id: userId,
                email: email,
                name: fullName,
                pass: password,
                picture: '/resources/defaultProfilePicture.png'
            }

            if (allUsers === null || allUsers == "") {
                allUsers = [newCredentials];
            } else {
                allUsers = allUsers;
                allUsers.push(newCredentials);
            }
    
            window.localStorage.setItem('users', JSON.stringify(allUsers));
            window.location.replace('/log-ind.html');
        } else {
            document.getElementById('alert-text').textContent = 'E-mailen er optaget.';
        }
    })
})
