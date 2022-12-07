import {updateTimestamp, updateDate, updateTimezone} from '/scripts/renderTimeAndDate.js';
import {renderWeather} from '/scripts/renderWeather.js';
import {renderArticles} from '/scripts/renderArticles.js';
import {viewProfile, viewFavorites} from '/scripts/views.js';
import {logout} from '/scripts/updateAccount.js';

// Denne funktion bliver kaldt når siden er loaded og den sørger for at alle de nødvendige elementer bliver vist på siden
window.addEventListener('DOMContentLoaded', async () => {
    let view = document.getElementById('view');
    window.navItems = document.querySelectorAll('.nav-item span');
    let userInfoSection = document.getElementById('user-info');

    const allUsers = JSON.parse(window.localStorage.getItem('users'));

    // Her defineres api-nøglen baseret på et eksternt json dokument
    const apiKeys = (await fetch('/resources/apikeys.json')
                        .then(response => response.json()).
                        then(result => {return result})).keys;

    // Med denne funktion hentes artiklerne og bliver vist på siden
    renderArticles(apiKeys.newsapi);

    updateTimestamp();
    updateDate();
    updateTimezone();
    window.timestampInterval = setInterval(updateTimestamp, 1000);

    renderWeather(apiKeys.openMeteo);

    let userId = window.sessionStorage.getItem('userId');
    let user;

    if (userId !== null) {
        for (let i = 0; i < allUsers.length; i++) {
            if (allUsers[i].id == userId) {
                user = allUsers[i];
                break;
            }
        }
    }

    // Hvis brugeren er logget ind, så bliver brugerens navn og en logout knap vist
    if (user) {
        userInfoSection.innerHTML = `
            <p>${user.name}</p>
            <span id='profile-btn'>
            <img src='/resources/defaultProfilePicture.png' style='width:40px; border-radius: 50%'></span>
            <span id='logout-btn' class='material-symbols-rounded'>logout</span>
        `;
        
        let logoutBtn = document.getElementById('logout-btn');
        let profileBtn = document.getElementById('profile-btn');

        logoutBtn.addEventListener('click', logout);

        profileBtn.addEventListener('click', () => {
            clearInterval(timestampInterval);
            viewProfile(allUsers, user, navItems);
        });

        let favoriteCategories = JSON.parse(window.localStorage.getItem('favoriteCategories'));
        if (favoriteCategories) {
            let userFavoriteCategories = favoriteCategories.filter(user => user.userId == userId)[0];

            if (userFavoriteCategories) {
                userFavoriteCategories = userFavoriteCategories.categories;
                let categorySection = document.createElement('div');
                let headline = document.createElement('p');
                headline.classList.add('h2');
                headline.textContent = "Favoritkategorier";

                let categoryDiv = document.createElement('div');
                categoryDiv.classList.add('time-weather-container');
                categoryDiv.style.display = 'block';

                userFavoriteCategories.forEach(category => {
                    let categoryBtn = document.createElement('button');
                    categoryBtn.classList.add('btn', 'btn-secondary');
                    categoryBtn.style.margin = '10px';
                    categoryBtn.textContent = category;

                    categoryBtn.addEventListener('click', () => {
                        renderArticles(apiKeys.newsapi, null, null, null, true, category);
                    })

                    categoryDiv.appendChild(categoryBtn);
                });

                categorySection.appendChild(headline);
                categorySection.appendChild(categoryDiv);
                document.querySelector('.right-side').appendChild(categorySection);
            }
        }
    } else {
        userInfoSection.innerHTML = `
            <a href='/opret-bruger.html'>
                <button class='btn btn-primary'>Opret bruger</button>
            </a>
            <a href='/log-ind.html' style='margin-left: 15px;'>
                <button class='btn btn-secondary'>Log ind</button>
            </a>`;
    }

    let homeBtn = document.getElementById('home-btn');
    let favoriteBtn = document.getElementById('favorite-btn');
    let searchForm = document.getElementById('search-form');

    homeBtn.addEventListener('click', () => {
        window.location.replace('/');
    })

    favoriteBtn.addEventListener('click', () => {
        clearInterval(timestampInterval);
        viewFavorites(navItems, userId, apiKeys.newsapi);
    })

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let query = document.getElementById('search-query').value;
        let publisher = document.getElementById('search-publisher').value;

        renderArticles(apiKeys.newsapi, true, query, publisher);
    })
})
