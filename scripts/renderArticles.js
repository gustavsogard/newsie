// Denne funktion henter artikler fra newsapi.org (både for søgninger, kategorier og som standard) og returnerer dem som et json objekt
async function getArticles(apikey, size, page, search=false, query, publisher, category=false, addCategory) {
    if (search) {
        return fetch(`https://newsapi.org/v2/everything/?q=${query}&domains=${publisher}&pageSize=${size}&page=${page}&apiKey=${apikey}`)
            .then(response => response.json())
            .then(result => {return result});
    } else if (category) {
        return fetch(`https://newsapi.org/v2/top-headlines/?category=${addCategory}&pageSize=${size}&page=${page}&apiKey=${apikey}`)
            .then(response => response.json())
            .then(result => {return result});
    } else {
        return fetch(`https://newsapi.org/v2/top-headlines/?pageSize=${size}&page=${page}&country=US&apiKey=${apikey}`)
            .then(response => response.json())
            .then(result => {return result});
    }
}

// Denne funktion bliver kaldt når der skal vises artikler på siden. Den tilføjer artiklerne til en div med id'et "articles"
function createArticles(articles, add=false) {
    let allArticlesDiv = document.getElementById('articles');
    let count = 0;

    if (add) {
        let newRow = document.createElement('div');
        newRow.classList.add('article-row');
        allArticlesDiv.appendChild(newRow);
    }

    articles.forEach(article => {
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
        let userId = window.sessionStorage.getItem('userId');

        if (userId && readArticles) {
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

            allArticlesDiv.appendChild(newRow);

            count = 0;
        }
    })
}

// Denne funktion ændrer på localStorage 'seenArticles' baseret på de artikler der benyttes som et parameter
function updateStorage(articles) {
    let seenArticles = JSON.parse(window.localStorage.getItem('seenArticles'));
    let currentArticles = [];

    if (!seenArticles) {
        let count = 1;
        articles.forEach(article => {
            article.id = count;
            count++;
        })
        seenArticles = [...articles];
    } else {
        let id = Math.max(...(seenArticles.map(article => article.id)));
        let count = 1;
        let urls = seenArticles.map(article => article.url);
        for (let i = 0; i < articles.length; i++) {
            if (!(urls.includes(articles[i].url))) {
                articles[i].id = id + count;
                seenArticles.push(articles[i]);
                currentArticles.push(articles[i]);
                count++;
            } else {
                articles[i].id = seenArticles.filter(article => {
                    if (article.url == articles[i].url) {
                        return article;
                    }
                })[0].id;
            }
        }
    }

    window.localStorage.setItem('seenArticles', JSON.stringify(seenArticles));
    return articles;
}

// Denne funktion er hovedfunktionen for alt der har med artikler at gøre. Den kan både bruges til forsiden, søgninger og visning af kategorier. Den kalder de andre 3 funktioner
export async function renderArticles(apikey, search=false, query, publisher, category=false, addCategory) {
    let articles;
    let userId = window.sessionStorage.getItem('userId');

    if (search) {
        document.getElementById('news').innerHTML = `
            <p class="h2">Nyheder</p>
            <div class="inner-header" style="height: 300px">
                <img style="width: 80px" src="/resources/loading.gif">
            </div>
        `;
        articles = await getArticles(apikey, 7, 1, true, query, publisher);
    } else if (category) {
        document.getElementById('news').innerHTML = `
            <p class="h2">Nyheder</p>
            <div class="inner-header" style="height: 300px">
                <img style="width: 80px" src="/resources/loading.gif">
            </div>
        `;
        articles = await getArticles(apikey, 7, 1, false, null, null, true, addCategory);
    } else {
        articles = await getArticles(apikey, 7, 1);
    }

    let articlePage = 3;

    let newsDiv = document.getElementById('news');

    await fetch('./documents/articles-view.html')
        .then(document => document.text())
        .then(html => newsDiv.innerHTML = html);

    if (articles.status == 'ok' && articles.articles.length > 0) {
        articles = articles.articles;

        articles = updateStorage(articles);

        let firstArticle = articles.shift();
        let imageUrl;

        if (firstArticle.urlToImage) {
            imageUrl = firstArticle.urlToImage;
        } else {
            imageUrl = 'resources/noImagePlaceholder.jpeg';
        }

        document.getElementById('banner').style.backgroundImage = `linear-gradient(to bottom, transparent 30%, #363a558b 60%, #363a55e1 90%), url('${imageUrl}')`;
        document.getElementById('bannerTitle').textContent = `${firstArticle.title}`;
        document.getElementById('bannerPublisher').textContent = `${firstArticle.source.name}`;
        document.getElementById('bannerLink').setAttribute('onclick', `viewArticle(${firstArticle.id}, timestampInterval, navItems)`);

        let readArticles = JSON.parse(window.localStorage.getItem('readArticles'));

        if (userId && readArticles) {
            readArticles = readArticles.filter(user => user.userId == userId)[0];
            if (readArticles) {
                if (readArticles.articles.includes(firstArticle.url)) {
                    document.getElementById('bannerLink').insertAdjacentHTML('beforebegin', '<span class="article-read">LÆST</span>');
                }
            }
        }

        createArticles(articles);

        let loadMore = document.getElementById('loadMore');

        if (search) {
            loadMore.addEventListener('click', async () => {
                let articles = (await getArticles(apikey, 6, articlePage, true, query, publisher)).articles;
                if (articles.length > 0) {
                    updateStorage(articles);
                    createArticles(articles, true);
                    articlePage++;
                }
            })
        } else if (category) {
            loadMore.addEventListener('click', async () => {
                let articles = (await getArticles(apikey, 6, articlePage, false, null, null, true, addCategory)).articles;
                if (articles.length > 0) {
                    updateStorage(articles);
                    createArticles(articles, true);
                    articlePage++;
                }
            })
        } else {
            loadMore.addEventListener('click', async () => {
                let articles = (await getArticles(apikey, 6, articlePage)).articles;
                if (articles.length > 0) {
                    updateStorage(articles);
                    createArticles(articles, true);
                    articlePage++;
                }
            })
        }
    } else {
        document.getElementById('banner').style.background = 'linear-gradient(to bottom, transparent 0%, #363a558b 40%, #363a55e1 90%)';
        document.getElementById('bannerTitle').textContent = 'Der skete en fejl ved hentning af nyheder';
        
        let reload = document.querySelector('#bannerLink')
        reload.innerHTML = 'Genindlæs';
        reload.addEventListener('click', () => {location.reload()})
    }
}