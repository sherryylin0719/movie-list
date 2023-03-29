const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector("#data-panel")
const paginator = document.querySelector("#paginator")
const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []


function renderMovieList(data) {
  let movieHTML = ""
  data.forEach((item) => {
    // image, title
    movieHTML += `
  <div class="col-lg-3 col-md-4 col-sm-5">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id ="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  `
  })
  dataPanel.innerHTML = movieHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "Release date:" + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img
      src="${POSTER_URL + data.image}"
      alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert("此電影已在我的最愛中")
  }
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

function getMoviesByPage(page) {
  //計算起始index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後陣列
  const data = filteredMovies.length ? filteredMovies : movies
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page ="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
}).catch((err) => console.log(err))

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  const page = event.target.dataset.page
  renderMovieList(getMoviesByPage(page))
})

//設置search bar的submit事件監聽器
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

function onSearchFormSubmitted(event) {
  event.preventDefault() //避免網頁重新導向當前頁面
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword)
  })
  //處理無符合條件的結果
  if (filteredMovies.length === 0) {
    alert(`您輸入的關鍵字${keyword}沒有符合的結果`)
    renderMovieList(getMoviesByPage(1))
    return searchInput.value = ""
  }
  renderMovieList(getMoviesByPage(1))
  renderPaginator(filteredMovies.length) //重新渲染分頁器
}
//searchForm.addEventListener("submit", onSearchFormSubmitted) 
searchForm.addEventListener("input", onSearchFormSubmitted)