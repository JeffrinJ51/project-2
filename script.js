const API_KEY = "AIzaSyC_rZJgxadSGKHL5Tu7eHfea9cwvRFdW3M";
let currentPage = 0;
const maxResults = 10;
let history = [];

document.getElementById("searchBtn").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  if (query) {
    searchBooks(query, 0);
  }
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 0) {
    const query = document.getElementById("searchInput").value.trim();
    searchBooks(query, currentPage - 1);
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const query = document.getElementById("searchInput").value.trim();
  searchBooks(query, currentPage + 1);
});

document.getElementById("darkToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
});

async function searchBooks(query, page = 0) {
  const printType = document.getElementById("printType").value;
  const lang = document.getElementById("langRestrict").value;

  const startIndex = page * maxResults;
  let url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${API_KEY}`;

  if (printType) url += `&printType=${printType}`;
  if (lang) url += `&langRestrict=${lang}`;

  currentPage = page;
  updateHistory(query);

  const loader = document.getElementById("loader");
  const resultsDiv = document.getElementById("results");
  loader.classList.remove("hidden");
  resultsDiv.innerHTML = "";

  try {
    const res = await fetch(url);
    const data = await res.json();
    loader.classList.add("hidden");

    if (!data.items || data.totalItems === 0) {
      resultsDiv.innerHTML = "<p>No books found for your search.</p>";
      return;
    }

    displayResults(data.items);
  } catch (error) {
    loader.classList.add("hidden");
    console.error("Error fetching books:", error);
    resultsDiv.innerHTML = "<p>🚨 Failed to load books. Please try again later.</p>";
  }
}

function displayResults(books) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  books.forEach(book => {
    const info = book.volumeInfo;
    const cover = info.imageLinks?.thumbnail || "https://via.placeholder.com/128x193?text=No+Cover";
    const title = info.title || "No title";
    const authors = info.authors?.join(", ") || "Unknown author";
    const desc = info.description || "No description available.";

    const bookCard = document.createElement("div");
    bookCard.className = "book";
    bookCard.innerHTML = `
      <img src="${cover}" alt="${title}" />
      <h3>${title}</h3>
      <p><strong>Author(s):</strong> ${authors}</p>
      <p>${desc.substring(0, 200)}...</p>
    `;
    resultsDiv.appendChild(bookCard);
  });
}

function updateHistory(query) {
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 5) history.pop();
  }

  const historyList = document.getElementById("searchHistory");
  historyList.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.addEventListener("click", () => {
      document.getElementById("searchInput").value = item;
      searchBooks(item, 0);
    });
    historyList.appendChild(li);
  });
}
