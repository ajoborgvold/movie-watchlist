const moviesContainer = document.getElementById('movies-container')
const watchlistContainer = document.getElementById('watchlist-container')
const searchInput = document.getElementById('search-input')
const searchBtn = document.getElementById('search-btn')

let errorMessage = ''
let searchArray = []
let moviesArray = []
let moviesFromLocalStorage = JSON.parse(localStorage.getItem('watchlist'))

if (moviesFromLocalStorage) {
    moviesArray = moviesFromLocalStorage
}


//----- Event listeners -----//
searchInput && searchInput.addEventListener('input', () => {
    searchBtn.classList.remove('disabled')
    searchBtn.classList.add('enabled')
})

if (searchBtn) {
    // searchArray = []
    moviesContainer.textContent = ''
    searchBtn.addEventListener('click', searchMovie)
}

// searchBtn && searchBtn.addEventListener('click', searchMovie)

moviesContainer && document.addEventListener('click', function(e){
    if (e.target.dataset.movie) {
        addMovieToWatchlist(e.target.dataset.movie)
    }
})

watchlistContainer && renderWatchlist()

watchlistContainer && document.addEventListener('click', e => {
    if (e.target.dataset.movie) {
        removeMovieFromWatchlist(e.target.dataset.movie)
    }
})


//----- Call to the API -----//
function searchMovie() {
    // moviesContainer.textContent = ''
    searchArray = []
    fetch(`https://www.omdbapi.com/?s=${searchInput.value}&apikey=60cf1e4a`)
        .then(res => {
            if (!res.ok) {
                throw Error('No response from API')
                errorMessage = `The movie database is currently unavailable. <br>Please try again later.`
                renderErrorMessage()
            }
            else {
                return res.json()
            }
        })
        .then(data => {
            if (data.Error) {
                console.log('No data matching the search result')
                errorMessage = `Unable to find what you're looking for. <br>Please try another search.`
                renderErrorMessage()
            }
            else {
                moviesContainer.textContent = ''
                handleMovieData(data.Search)
            }
        })
        .catch(err => {
            console.error(err)
            renderErrorMessage()
        })
}


//----- Render error message to the user -----//

function renderErrorMessage() {
    moviesContainer.innerHTML = `
        <h2 class="error-message">${errorMessage}</h2>
    `
    searchInput.value = ''
}


//----- Handle data from API call -----//

function handleMovieData(data) {
    // moviesContainer.textContent = ''
    
    data.map(movie => {
        fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=60cf1e4a`)
            .then(res => res.json())
            .then(movieData => {
                // console.log(movieData)
                moviesContainer.textContent = ''
                if (movieData.Poster != "N/A") {
                    searchArray.push(movieData)
                }
                renderMovies(searchArray)
            })
    })
}


//----- Render movies from search -----//

function renderMovies(data) {
    // console.log(data)
    
    data.map(data => {
        const movieId = data.imdbID
        
    //----- Check if searched movie has already been added to the watchlist. If so, change the add button to an "added" tag -----//
        let addToWatchlistHtml = ''
        const found = moviesArray.some(item => item.imdbID === movieId)
        
        if (!found) {
            addToWatchlistHtml = `
                <div class="movie__watchlist-btn flex" id="${movieId}" data-movie="${movieId}">
                    <i class="fa-solid fa-circle-plus movie-icon" data-movie="${movieId}"></i>
                    <p data-movie="${movieId}">Watchlist</p>
                </div>
            `
        }
        else {
            addToWatchlistHtml = `
                <div class="movie__watchlist-btn highlight flex" id="${movieId}" data-movie="${movieId}">
                    <i class="fa-solid fa-check movie-icon"></i>
                    <p>Added</p>
                </div>
            `
        }
        
    //----- Create and render the html -----//
        moviesContainer.innerHTML += `
            <div class="movie-wrapper flex">
                <img src="${data.Poster}" class="movie__poster">
                <div class="movie__info flex">
                    <div class="movie__info-top flex">
                        <h2>${data.Title}</h2>
                        <i class="fa-solid fa-star"></i>
                        <p class="small">${data.imdbRating}</p>
                    </div>
                    <div class="movie__info-center flex">
                        <div class="movie__info-center--facts flex">
                            <p class="small">${data.Runtime}</p>
                            <p class="small">${data.Genre}</p>
                        </div>
                        ${addToWatchlistHtml}
                    </div>
                    <p class="movie__plot">${data.Plot}</p>
                </div>
            </div>
        `  
    })
    
    searchInput.value = ''
}


//----- Add movie to watchlist/save movie to local storage -----//
                
function addMovieToWatchlist(movieId) {
    fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=60cf1e4a`)
        .then(res => res.json())
        .then(data => {
            const found = moviesArray.some(item => item.imdbID === data.imdbID)
            !found && moviesArray.push(data)
            localStorage.setItem('watchlist', JSON.stringify(moviesArray))
        })
        
    document.getElementById(movieId).innerHTML = `
        <i class="fa-solid fa-check movie-icon"></i>
        <p>Added</p>
    `
    document.getElementById(movieId).classList.add('highlight')
}


//----- Render watchlist with movies saved to local storage -----//

function renderWatchlist() {
    if (!moviesFromLocalStorage.length) {
        watchlistContainer.innerHTML = `
            <div class="watchlist-start-page flex" id="watchlist-start-page">
                <h2>Your watchlist is looking a little empty...</h2>
                <a href="index-html"><div class="watchlist-start-page__bottom flex">
                    <i class="fa-solid fa-circle-plus"></i>
                    <p>Let's add some movies</p>
                </div></a>
            </div>
        `
    }
    else {        
        moviesFromLocalStorage.map(movie => 
            watchlistContainer.innerHTML += `
                <div class="movie-wrapper flex">
                    <img src="${movie.Poster}" class="movie__poster">
                    <div class="movie__info flex">
                        <div class="movie__info-top flex">
                            <h2>${movie.Title}</h2>
                            <i class="fa-solid fa-star"></i>
                            <p class="small">${movie.imdbRating}</p>
                        </div>
                        <div class="movie__info-center flex">
                            <div class="movie__info-center--facts flex">
                                <p class="small">${movie.Runtime}</p>
                                <p class="small">${movie.Genre}</p>
                            </div>
                            <div class="movie__watchlist-btn flex" id="remove-btn" data-movie="${movie.imdbID}">
                                <i class="fa-solid fa-circle-minus movie-icon" data-movie="${movie.imdbID}"></i>
                                <p data-movie="${movie.imdbID}">Watchlist</p>
                            </div>
                        </div>
                        <p class="movie__plot">${movie.Plot}</p>
                    </div>
                </div>
            `
            )
    }
}


//----- Remove movie from watchlist and from the array in local storage -----//

function removeMovieFromWatchlist(movieId) {    
    moviesArray.map(item => {
        if (item.imdbID === movieId) {
            const targetMovie = moviesArray.indexOf(item)
            moviesArray.splice(targetMovie, 1)
        }
    })
    
    localStorage.setItem('watchlist', JSON.stringify(moviesArray))
    watchlistContainer.textContent = ''
    renderWatchlist()
}