// Denne funktion opdaterer brugerens oplysninger baseret på de indtastede værdier i formen og opretter et nyt objekt med de nye oplysninger
export function updateAccount(e, allUsers, user) {
    e.preventDefault();
    if (confirm('Er du sikker på at du vil opdatere dine oplysninger?')) {
        let newEmail = document.getElementById('newEmail').value;
        let newFullName = document.getElementById('newFullName').value;
        let newPassword = document.getElementById('newPassword').value;

        let newUser = {
            id: user.id,
            email: newEmail == '' ? user.email: newEmail,
            name: newFullName == '' ? user.name: newFullName,
            pass: newPassword == '' ? user.pass: btoa(newPassword)
        }

        allUsers.splice(allUsers.findIndex(obj => obj.id == user.id), 1);
        
        user = newUser;
        allUsers.push(user);

        if (newFullName !== '') {
            document.querySelector('#user-info p').textContent = newUser.name;
        }

        window.localStorage.setItem('users', JSON.stringify(allUsers));
        document.getElementById('newEmail').value = '';
        document.getElementById('newFullName').value = '';
        document.getElementById('newPassword').value = '';
        alert('Dine oplysninger er blevet opdateret.');
    }
}

// Denne funktion sletter brugerens oplysninger fra local storage og sender brugeren til forsiden
export function deleteAccount(allUsers, user) {
    if (confirm('Er du sikker på at du vil slette din bruger?')) {
        allUsers.splice(allUsers.findIndex(obj => obj.id == user.id), 1);
        let favoriteCategories = JSON.parse(window.localStorage.getItem('favoriteCategories'));
        favoriteCategories.splice(favoriteCategories.findIndex(obj => obj.userId == user.id), 1);
        let readArticles = JSON.parse(window.localStorage.getItem('readArticles'));
        readArticles.splice(readArticles.findIndex(obj => obj.userId == user.id), 1);
        let favoriteArticles = JSON.parse(window.localStorage.getItem('favoriteArticles'));
        favoriteArticles.splice(favoriteArticles.findIndex(obj => obj.userId == user.id), 1);

        window.localStorage.setItem('favoriteCategories', JSON.stringify(favoriteCategories));
        window.localStorage.setItem('users', JSON.stringify(allUsers));
        window.localStorage.setItem('readArticles', JSON.stringify(readArticles));
        window.localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles));
        window.sessionStorage.removeItem('userId');
        window.location.replace('/');
    }
}

// Denne funktion logger brugeren ud og sender brugeren til log ind siden
export function logout() {
    if (confirm('Er du sikker på at du vil logge ud?')) {
        window.sessionStorage.removeItem('userId');
        window.location.replace('/log-ind.html');
    }
}