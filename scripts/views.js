import {updateAccount, deleteAccount} from './updateAccount.js';
import {renderArticles} from './renderArticles.js';

// Denne funktion viser oplysninger og brugeren og giver mulighed for at opdatere brugerens oplysninger
export async function viewProfile(allUsers, user, navItems) {
    await fetch('./documents/profile-view.html')
        .then(document => document.text())
        .then(html => view.innerHTML = html);

    navItems.forEach(item => item.classList.remove('active-nav'));

    document.getElementById('update-form').addEventListener('submit', (e) => {updateAccount(e, allUsers, user)});
    document.getElementById('deleteUser').addEventListener('click', () => {deleteAccount(allUsers, user)});
}

// Denne funktion viser brugerens favoritartikler og kategorier
export async function viewFavorites(navItems, userId, apikey) {
    await fetch('./documents/favorites-view.html')
        .then(document => document.text())
        .then(html => view.innerHTML = html);

    navItems.forEach(item => item.classList.remove('active-nav'));
    document.querySelector('#favorite-btn span').classList.add('active-nav');

    let articlesDiv = document.getElementById('articles');
    let count = 0;

    let favoriteArticles = JSON.parse(window.localStorage.getItem('favoriteArticles'));

    if (userId && favoriteArticles) {
        favoriteArticles = favoriteArticles.filter(user => user.userId == userId)[0];
        if (favoriteArticles) {
            favoriteArticles = favoriteArticles.articles.reverse();
            if (favoriteArticles.length !== 0) {
                favoriteArticles.forEach(article => {
                    let newArticle = document.createElement('div');
                    newArticle.classList.add('article-div');

                    let imageUrl;

                    if (article.urlToImage) {
                        imageUrl = article.urlToImage;
                    } else {
                        imageUrl = 'resources/noImagePlaceholder.jpeg';
                    }

                    newArticle.innerHTML = `
                        <div class="article-picture" style="background-image: url('${imageUrl}')"></div>
                        <div class="article-content">
                            <div class="article-title" style="cursor:default">${article.title}</div>
                            <div class="article-misc">
                                <p class="article-publisher">${article.source.name}</p>
                                <a target="_blank"><button onclick="viewArticle(${article.id}, timestampInterval, navItems)" class="btn btn-primary readMoreBtn">Læs mere</button></a>
                                </div>
                            </div>
                    `;

                    let readArticles = JSON.parse(window.localStorage.getItem('readArticles'));
    
                    if (readArticles) {
                        readArticles = readArticles.filter(user => user.userId == userId)[0];
                        if (readArticles) {
                            if (readArticles.articles.includes(article.url)) {
                                newArticle.children[0].innerHTML ='<span class="article-read">LÆST</span>';
                            }
                        }
                    }

                    if (count < 3) {
                        let articleRows = document.querySelectorAll('.article-row');
                        let lastRow = articleRows[articleRows.length - 1];
    
                        lastRow.appendChild(newArticle);
    
                        count++;
                    } else {
                        let newRow = document.createElement('div');
                        newRow.classList.add('article-row');
                        newRow.appendChild(newArticle);
    
                        articlesDiv.appendChild(newRow);
    
                        count = 0;
                    }
                })
            } else {
                articlesDiv.classList.add('inner-header');
                articlesDiv.style.height = '100px';
                articlesDiv.innerHTML = 'Du har endnu ikke tilføjet artikler til dine favoritter.';
            }
        } else {
            articlesDiv.classList.add('inner-header');
            articlesDiv.style.height = '100px';
            articlesDiv.innerHTML = 'Du har endnu ikke tilføjet artikler til dine favoritter.';
        }
    } else if (userId) {
        articlesDiv.classList.add('inner-header');
        articlesDiv.style.height = '100px';
        articlesDiv.innerHTML = 'Du har endnu ikke tilføjet artikler til dine favoritter.';
    } else {
        articlesDiv.classList.add('inner-header');
        articlesDiv.style.height = '100px';
        articlesDiv.innerHTML = 'Du skal oprette en bruger for at tilføje artikler til favoritter.';
    }

    let categoryDiv = document.getElementById('favorite-categories');
    let categories = ['Business', 'Entertainment', 'General', 'Health', 'Science', 'Sports', 'Technology'];

    categories.forEach(category => {
        let userFavoriteArticles = JSON.parse(window.localStorage.getItem('favoriteCategories'));
        if (userFavoriteArticles && userId) {
            userFavoriteArticles = userFavoriteArticles.filter(user => user.userId == userId)[0];
            if (userFavoriteArticles) {
                userFavoriteArticles = userFavoriteArticles.categories;
            } else {
                userFavoriteArticles = [];
            }
        } else {
            userFavoriteArticles = [];
        }

        let newElement = document.createElement('div');
        newElement.style.display = 'flex';

        let button = document.createElement('button');
        button.classList.add('btn', 'btn-primary');
        button.textContent = category;

        newElement.appendChild(button);

        newElement.childNodes[0].addEventListener('click', () => {
            renderArticles(apikey, null, null, null, true, category);
        })

        let favBtn = document.createElement('button');
        favBtn.innerHTML = `<span class="material-symbols-rounded article-favorite">favorite</span>`;
        favBtn.style.all = 'unset';

        if (!userFavoriteArticles.includes(category)) {
            favBtn.setAttribute('onclick', `addCategoryToFavorites(this, '${category}')`);
        } else {
            favBtn.setAttribute('onclick', `removeCategoryFromFavorites(this, '${category}')`);
            favBtn.childNodes[0].classList.add('enabled-favorite');
        }

        newElement.appendChild(favBtn);
        categoryDiv.appendChild(newElement);
    })
}
