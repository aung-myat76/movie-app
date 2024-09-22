const global = {
  path: window.location.pathname,
  api: {
    key: "30c756ef0ec10bb6520086cd56342f4b",
    url: "https://api.themoviedb.org/3/"
  },
  search: {
    type: "",
    name: "",
    page: 1,
    totalPages: 1
  }
}

function highlightLinks() {
  if (global.path === "/movie.html" || global.path === "/movie-detail.html") {
    document.querySelector(".nav-link[href='/movie.html']").classList.add("active")
  } else if (global.path === "/tv.html" || global.path === "/tv-detail.html") {
    document.querySelector(".nav-link[href='/tv.html']").classList.add("active")
  }
  
}

function showAlert(msg) {
  const msgContainer = document.querySelector(".alert");
  
  document.querySelector(".alert-msg").innerText = msg;
  msgContainer.classList.replace("d-none", "d-block");
  
  setTimeout(() => {
    msgContainer.classList.replace("d-block", "d-none");
  }, 3000)
}

async function search() {
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  global.search.type = urlParams.get("type");
  global.search.name = urlParams.get("name");
  
  if(global.search.name !== "" && global.search.name !== null) {
    const { results, page, total_pages, total_results } = await searchDataFromApi();
    
    if(results.length === 0) {
      showAlert("Not Found");
      return;
    }
    
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    
    results.forEach(data => {
      createMoviePoster(global.search.type, data);
    })
    createPagination();
    } else {
    showAlert("Input is empty");
  }
  
  
  
  document.querySelector("#search").value = "";
}

function createPagination() {
  const paginationContainer = document.querySelector(".pagination-container");
  const div = document.createElement("div");
  const paginationHeading = document.createElement("div");
  const btnContainer = document.createElement("div");
  const nextBtn = document.createElement("button");
  const preBtn = document.createElement("button");
  
  const type = global.path.split(".")[0].slice(1);
  
  div.className = "col-10";
  paginationHeading.className = "fw-bold text-center mb-3";
  nextBtn.setAttribute("id", "next")
  preBtn.setAttribute("id", "pre")
  nextBtn.className = "btn btn-primary mx-3";
  preBtn.className = "btn btn-primary";
  
  paginationHeading.innerHTML = `<span class="current-page">Page ${ global.search.page } </span> of ${ global.search.totalPages }<span class="text-info">${ type !== "search" ? "" : "for " + global.search.name } </span>`;
  nextBtn.innerText = "Next";
  preBtn.innerText = "Previous";
  
  btnContainer.append(preBtn, nextBtn);
  div.append(paginationHeading, btnContainer);
  paginationContainer.appendChild(div);
  
  console.log(global.search.page, global.search.totalPages)
  global.search.page === 1 ? preBtn.disabled = true : preBtn.disabled = false;
  global.search.page === global.search.totalPages? nextBtn.disabled = true : nextBtn.disabled = false;
  
  nextBtn.addEventListener("click", async () => {
    global.search.page++;
    global.search.page === 1 ? preBtn.disabled = true : preBtn.disabled = false;
    global.search.page === global.search.totalPages ? nextBtn.disabled = true : nextBtn.disabled = false;
    
    document.querySelector(`.${type}-list`).innerHTML = "";
    document.querySelector(".current-page").innerText = "Page " + global.search.page;
    
    const { results } = type !== "search" ? await getDataFromApi(`discover/${ type }`) : await searchDataFromApi();
    results.forEach(data => {
      type !== "search" ? createMoviePoster(type, data) : createMoviePoster(global.search.type, data)
    })
  })
  preBtn.addEventListener("click", async () => {
    global.search.page--;
    global.search.page === 1 ? preBtn.disabled = true : preBtn.disabled = false;
    global.search.page === global.search.totalPages? nextBtn.disabled = true : nextBtn.disabled = false;
    
    document.querySelector(`.${ type }-list`).innerHTML = "";
    document.querySelector(".current-page").innerText = "Page " + global.search.page
    
    const { results } = type !== "search" ? await getDataFromApi(`discover/${ type }`) : await searchDataFromApi();
    results.forEach(data => {
      type !== "search" ? createMoviePoster(type, data) : createMoviePoster(global.search.type, data)
    })
  })
}

async function slideNowPlayingMovie(type) {
  const { results } = await getDataFromApi(`${type}/now_playing`);
  
  results.forEach((data, index) => {
    const div = document.createElement("div");
    const a = document.createElement("a");
    const img = document.createElement("img");
    const inner = document.querySelector(".carousel-inner");
    const poster = data.poster_path;
    const movieName = document.createElement("h5");
    
    a.setAttribute("href", `/${type}-detail.html?id=${data.id}`);
    div.className = "carousel-item opacity-75";
    img.className = "d-block w-100"
    
    poster
    ? img.setAttribute("src", `https://tmdb.org/t/p/w500${poster}`)
    : img.setAttribute("src", "./assent/unavailable.jpg");
    img.setAttribute("title", data.title);
   
    index === 0 ? div.classList.add("active") : null;
     
    movieName.innerHTML = `<i class="bi bi-star-fill text-warning"></i> <small class="fw-bold">${data.vote_average.toFixed(1)} / 10</small>`;
    movieName.className = "position-absolute bottom-0 start-50 translate-middle-x";
    
    a.appendChild(img)
    div.append(a, movieName);
    inner.appendChild(div);
    
  })
}

async function getPopularMovie() {
  const { results } = await getDataFromApi("movie/popular");
  results.forEach(result => {
    createMoviePoster("movie", result);
  })
}

async function getMovie() {
  const { results, page, total_pages } = await getDataFromApi("discover/movie");
  
  global.search.page = page;
  global.search.totalPages = total_pages;
  
  results.forEach(movie => {
    createMoviePoster("movie", movie);
  })
  createPagination();
}

async function getTv() {
  const { results, page, total_pages } = await getDataFromApi("discover/tv");
  
  global.search.page = page;
  global.search.totalPages = total_pages;
  
  results.forEach(tv => {
    createMoviePoster("tv", tv);
  })
  createPagination();
}

async function getMovieDetail(type) {
  const id = window.location.search.split("=")[1]
  const data = await getDataFromApi(`${type}/${id}`);
  const bgPath = await data.backdrop_path;
  
  createMovieDetail(type, data);
  addMovieBackdrop(bgPath);
}

function addMovieBackdrop(bgPath) {
  const overlay = document.querySelector(".overlay");
  overlay.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${bgPath})`;
}

// For movie detail need to fix
async function createMovieDetail(type, data) {
  const container = document.createElement("div");
  const imgOverlay = document.createElement("div");
  const img = await imgChecker(data);
  const name = document.createElement("p");
  const rating = document.createElement("p");
  const genre = document.createElement("p");
  const releaseDate = document.createElement("p");
  const review = document.createElement("p");

  container.className = "text-light fw-bold detail";
  img.classList.add("w-50");
  img.classList.add("mb-3");
  imgOverlay.className = "overlay";
  name.innerHTML = `<span class='fs-3 fw-bold'>Name</span> - <span>${ type === "movie" ? data.title : data.name }</span>`;
  rating.innerHTML = `<span class='fw-bold'><i class='bi bi-star-fill text-warning me-2'></i></span><span>${data.vote_average.toFixed(1)} / 10</span>`;
  genre.innerHTML = `<span class='fw-bold'>Genre</span> - <span>${data.genres.map(genre => genre.name)}</span>`;
  releaseDate.innerHTML = `<span class='fw-bold'>${ type === "movie" ? "Release Date" : "First Air Date" }</span> - <span>${ type === "movie" ? data.release_date : data.first_air_date }</span>`;
  review.innerHTML = `<span class='fw-bold'>Review</span> - <span>${data.overview}</span>`;
  
  container.append(imgOverlay, img,  name, rating, genre, releaseDate, review);
  document.querySelector(`.${type}-detail`).appendChild(container);
  
}

// For Home page to create movie cards
async function createMoviePoster(type, data) {
  const link = document.createElement("a");
  const container = document.createElement("div");
  const p = document.createElement("p");
  const body = document.createElement("div");
  
  link.className = "link-underline-opacity-0";
  link.setAttribute("href", `/${type}-detail.html?id=${data.id}`);
  
  container.className = "card col-10 col-lg-3 border-light g-0 mx-3 mb-3 bg-transparent";
  
  const img = await imgChecker(data);
  
  body.className = "card-body";
  
  p.className = "card-text text-center fw-bold fs-3";
  p.innerHTML = `<i class="bi bi-star-fill text-warning"></i> <small class="fw-bold">${data.vote_average.toFixed(1)} / 10</small>`;
  
  body.appendChild(p);
  link.appendChild(img)
  container.appendChild(link);
  container.appendChild(body);
  
  global.path === "/search.html" ? document.querySelector(`.search-list`).appendChild(container) : document.querySelector(`.${type}-list`).appendChild(container);
}

function imgChecker(data) {
  const img = document.createElement("img");
  
  data.poster_path
  ? img.setAttribute("src", `https://tmdb.org/t/p/w500${data.poster_path}`)
  : img.setAttribute("src", "./assent/unavailable.jpg");
  // img.setAttribute("title", data.title);
  img.className = "card-img-top";
  return img;
}

async function getDataFromApi(endpoint) {
  const API_KEY = global.api.key;
  const API_URL = global.api.url;

  const res = await fetch(`${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=${ global.search.page }`);
  const data = await res.json();
  
  return data;
}

async function searchDataFromApi() {
  const API_KEY = global.api.key;
  const API_URL = global.api.url;
  
  const res = await fetch(`${API_URL}search/${ global.search.type }?api_key=${API_KEY}&language=en-US&query=${ global.search.name }&page=${ global.search.page }`);
  const data = await res.json();
  
  return data;
}



function init() {
  switch (global.path) {
    case "":
    case "/":
    case "/index.html":
      slideNowPlayingMovie("movie")
      getPopularMovie();
      console.log("Home");
      break;
    case "/movie.html":
      getMovie();
      console.log("Movie");
      break;
    case "/tv.html":
      getTv();
      break;
    case "/movie-detail.html":
      getMovieDetail("movie")
      console.log("Movie Detail");
      break;
    case "/tv-detail.html":
      getMovieDetail("tv");
      console.log("Tv Detail");
      break;
    case "/search.html":
      search()
      console.log("search");
      break;
  }
  
  highlightLinks()
}


window.addEventListener("DOMContentLoaded", init)