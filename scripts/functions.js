// Denne funktion kaldes, når en enkelt artikel skal vises
async function viewArticle(id, timestampInterval, navItems) {
    // Her stopper timeren på forsiden og de aktive navigationselementer deaktiveres
    clearInterval(timestampInterval);
    navItems.forEach(item => item.classList.remove('active-nav'));

    // Her hentes indholdet af article-view.html og indsættes i viewet
    await fetch('./documents/article-view.html')
        .then(document => document.text())
        .then(html => view.innerHTML = html);

    let seenArticles = JSON.parse(window.localStorage.getItem('seenArticles'));
    let readArticles = JSON.parse(window.localStorage.getItem('readArticles'));

    // Her hentes den enkelte artikel ud fra dens id
    let article = seenArticles.filter(el => {
        return el.id === id;
    })[0];

    // Her defineres de forskellige elementer fra dokumentet
    let image = document.getElementById('article-image');
    let title = document.getElementById('article-title');
    let author = document.getElementById('article-author');
    let timestamp = document.getElementById('article-timestamp');
    let publisher = document.getElementById('article-publisher');
    let content = document.getElementById('article-content');
    let favoriteBtn = document.getElementById('article-favorite');
    let url = document.getElementById('article-url');
    let urlBtn = document.querySelector('#article-url button');

    let articleRow = document.getElementById('more-articles');

    image.style.backgroundImage = `url('${article.urlToImage}')`;
    title.textContent = article.title;
    author.textContent = article.author;
    timestamp.textContent = `${article.publishedAt.slice(0, 10)}, kl. ${article.publishedAt.slice(11, 16)}`;
    publisher.textContent = article.source.name;
    content.textContent = article.content;

    let favoriteArticles = JSON.parse(window.localStorage.getItem('favoriteArticles'));
    let userId = window.sessionStorage.getItem('userId');
    let flag = false;

    // Her tjekkes det om artiklen er blevet gemt som favorit og definerer derefter om onclick funktionen skal være addToFavorites eller removeFromFavorites
    if (userId && favoriteArticles) {
        favoriteArticles = favoriteArticles.filter(user => user.userId == userId)[0];

        if (favoriteArticles) {
            favoriteArticles.articles.forEach(favArticle => {
                if (favArticle.url == article.url) {
                    flag = true;
                }
            });
        }
    }

    if (flag) {
        favoriteBtn.setAttribute('onclick', `removeFromFavorites(${article.id})`);
        favoriteBtn.childNodes[0].classList.add('enabled-favorite');
    } else {
        favoriteBtn.setAttribute('onclick', `addToFavorites(${article.id})`);
    }

    url.href = article.url;
    urlBtn.setAttribute('onclick', `readArticle(${article.id})`);

    if (userId && readArticles) {
        let userReadArticles = readArticles.filter(user => user.userId == userId)[0];
        if (userReadArticles) {
            if (userReadArticles.articles.includes(article.url)) {
                image.innerHTML = '<div class="article-read">LÆST</div>';
            }
        }
    }

    let moreArticles = seenArticles.filter(el => {
        return el.id > id;
    }).slice(0, 3);

    moreArticles.forEach(article => {
        let newArticle = document.createElement('div');
        newArticle.classList.add('article-div', 'article-recommended');

        let imageUrl;

        if (article.urlToImage) {
            imageUrl = article.urlToImage;
        } else {
            imageUrl = 'resources/noImagePlaceholder.jpeg';
        }

        // For hver af de 3 ekstra artikler benyttes denne HTML
        newArticle.innerHTML = `
            <div class="article-picture" style="background-image: url('${imageUrl}');"></div>
            <div class="article-content">
                <div class="article-title">${article.title}</div>
                <div class="article-misc">
                    <p class="article-publisher">${article.source.name}</p>
                    <a target="_blank"><button onclick="viewArticle(${article.id}, timestampInterval, navItems)" class="btn btn-primary readMoreBtn">Læs mere</button></a>
                </div>
            </div>
        `;

        if (userId && readArticles) {
            let userReadArticles = readArticles.filter(user => user.userId == userId)[0];
            if (userReadArticles) {
                if (userReadArticles.articles.includes(article.url)) {
                    newArticle.children[0].innerHTML ='<span class="article-read">LÆST</span>';
                }
            }
        }

        articleRow.appendChild(newArticle);
    })
}

// Denne funktion tilføjer en artikel til læste artikler og kaldes, når der trykkes på læs mere knappen for en enkel artikel
function readArticle(id) {
    let userId = window.sessionStorage.getItem('userId');
    let article = JSON.parse(window.localStorage.getItem('seenArticles')).filter(el => {
        return el.id === id;
    })[0].url;

    if (!userId) {
        return;
    }

    let readArticles = JSON.parse(window.localStorage.getItem('readArticles'));
    if (!readArticles || readArticles.length == 0) {
        let readUser = {"userId": userId, "articles": [article]};

        readArticles = [readUser];
        window.localStorage.setItem('readArticles', JSON.stringify(readArticles));
    } else {
        let userReadArticles = readArticles.filter(user => user.userId == userId)[0];
        if (userReadArticles) {
            userReadArticles = userReadArticles.articles;
            if (!userReadArticles.includes(article)) {
                let index = readArticles.findIndex(user => user.userId == userId);
                userReadArticles.push(article);
    
                readArticles[index].articles = userReadArticles;
                window.localStorage.setItem('readArticles', JSON.stringify(readArticles));
            }
        } else {
            let readUser = {"userId": userId, "articles": [article]};

            readArticles.push(readUser);
            window.localStorage.setItem('readArticles', JSON.stringify(readArticles));
        }
    }
}

// Denne funktionen tilføjer en artikel til favoritter og kaldes, når der trykkes på favorit knappen for en enkel artikel
function addToFavorites(id) {
    let userId = window.sessionStorage.getItem('userId');
    let article = JSON.parse(window.localStorage.getItem('seenArticles')).filter(el => {
        return el.id === id;
    })[0];

    if (!userId) {
        alert('Opret en bruger for at tilføje artikler til favoritter.');
        return;
    }

    let favoriteArticles = JSON.parse(window.localStorage.getItem('favoriteArticles'));
    let userFavoriteArticles;

    if (favoriteArticles) {
        userFavoriteArticles = favoriteArticles.filter(user => user.userId == userId)[0];
    }

    // Her defineres objektet for brugeren ud fra om brugeren har favoritter eller ej
    if (!favoriteArticles || favoriteArticles.length == 0) {
        let favoritesUser = {"userId": userId, "articles": [article]};

        favoriteArticles = [favoritesUser];
        window.localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles));
        alert('Artiklen er tilføjet til dine favoritter.');
    } else if (!userFavoriteArticles) {
        let favoritesUser = {"userId": userId, "articles": [article]};

        favoriteArticles.push(favoritesUser);
        window.localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles));
        alert('Artiklen er tilføjet til dine favoritter.');
    } else {
        userFavoriteArticles = userFavoriteArticles.articles;
        let check = true;

        for (let i = 0; i < userFavoriteArticles.length; i++) {
            if (userFavoriteArticles[i].url === article.url) {
                check = false;
            }
        }

        if (check) {
            let index = favoriteArticles.findIndex(user => user.userId == userId);
            userFavoriteArticles.push(article);

            favoriteArticles[index].articles = userFavoriteArticles;
            window.localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles));

            let favoriteBtn = document.getElementById('article-favorite');
            favoriteBtn.childNodes[0].classList.add('enabled-favorite');
            favoriteBtn.setAttribute('onclick', `removeFromFavorites(${article.id})`);
            alert('Artiklen er tilføjet til dine favoritter.');
        } else {
            alert('Artiklen er allerede tilføjet til dine favoritter.');
        }
    }
}

// Denne funktionen fjerner en artikel fra favoritter og kaldes, når der igen trykkes på favorit knappen for en enkel artikel
function removeFromFavorites(id) {
    let userId = window.sessionStorage.getItem('userId');
    let article = JSON.parse(window.localStorage.getItem('seenArticles')).filter(el => {
        return el.id === id;
    })[0];

    let favoriteArticles = JSON.parse(window.localStorage.getItem('favoriteArticles'));

    let userFavoriteArticles = favoriteArticles.filter(user => user.userId == userId)[0].articles;
    let check = false;

    for (let i = 0; i < userFavoriteArticles.length; i++) {
        if (userFavoriteArticles[i].url === article.url) {
            check = true;
        }
    }

    if (check) {
        let index = favoriteArticles.findIndex(user => user.userId == userId);
        userFavoriteArticles = userFavoriteArticles.filter(favArticle => favArticle.id !== id);

        favoriteArticles[index].articles = userFavoriteArticles;
        window.localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles));

        let favoriteBtn = document.getElementById('article-favorite');
        favoriteBtn.childNodes[0].classList.remove('enabled-favorite');
        favoriteBtn.setAttribute('onclick', `addToFavorites(${article.id})`);

        alert('Artiklen er fjernet fra dine favoritter.');
    } else {
        alert('Artiklen er allerede fjernet fra dine favoritter.');
    }
}

// Denne funktion tilføjer en kategori til favoritter og kaldes, når der trykkes på favorit knappen for en enkelt kategori
function addCategoryToFavorites(button, category) {
    button = button.childNodes[0];

    let userId = window.sessionStorage.getItem('userId');

    let favoriteCategories = JSON.parse(window.localStorage.getItem('favoriteCategories'));

    // Her defineres objektet for brugeren ud fra om brugeren allerede har favoritkategorier eller ej
    if (!favoriteCategories || favoriteCategories.length == 0) {
        let favoritesUser = {"userId": userId, "categories": [category]};

        favoriteCategories = [favoritesUser];
    } else if (userId) {
        let userFavoriteCategories = favoriteCategories.filter(user => user.userId == userId)[0];

        if (userFavoriteCategories) {
            userFavoriteCategories = userFavoriteCategories.categories;
            if (!userFavoriteCategories.includes(category)) {
                let index = favoriteCategories.findIndex(user => user.userId == userId);
                userFavoriteCategories.push(category);
        
                favoriteCategories[index].categories = userFavoriteCategories;
            }
        } else {
            let favoritesUser = {"userId": userId, "categories": [category]};

            favoriteCategories.push(favoritesUser);
        }
    }

    if (!userId) {
        alert('Opret en bruger for at tilføje kategorier til dine favoritter.');
    } else {
        window.localStorage.setItem('favoriteCategories', JSON.stringify(favoriteCategories));
    
        button.classList.add('enabled-favorite');
        button.parentNode.setAttribute('onclick', `removeCategoryFromFavorites(this, '${category}')`);
        alert('Kategorien er tilføjet til dine favoritter.');
    }
}

// Denne funktion fjerner en kategori fra favoritter og kaldes, når der igen trykkes på favoritknappen for en enkelt kategori
function removeCategoryFromFavorites(button, category) {
    button = button.childNodes[0];
    let userId = window.sessionStorage.getItem('userId');

    let favoriteCategories = JSON.parse(window.localStorage.getItem('favoriteCategories'));

    let userFavoriteCategories = favoriteCategories.filter(user => user.userId == userId)[0].categories;
    let check = false;

    for (let i = 0; i < userFavoriteCategories.length; i++) {
        if (userFavoriteCategories[i] === category) {
            check = true;
        }
    }

    if (check) {
        let index = favoriteCategories.findIndex(user => user.userId == userId);
        userFavoriteCategories = userFavoriteCategories.filter(favCategory => favCategory !== category);

        favoriteCategories[index].categories = userFavoriteCategories;
        window.localStorage.setItem('favoriteCategories', JSON.stringify(favoriteCategories));

        button.classList.remove('enabled-favorite');
        button.parentNode.setAttribute('onclick', `addCategoryToFavorites(this, '${category}')`);

        alert('Kategorien er fjernet fra dine favoritter.');
    } else {
        alert('Kategorien er allerede fjernet fra dine favoritter.');
    }
}