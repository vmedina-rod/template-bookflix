var products = null;
var categories = null;
var title = null;

let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("titlebook");


const getBooks = async (book) => {
	const response = await fetch(
	  `https://www.googleapis.com/books/v1/volumes?q=${book}`
	);
	const data = await response.json();
	return data;
};

const extractThumbnail = ({ imageLinks }) => {
	const DEFAULT_THUMBNAIL = "icons/logo.svg";
	if (!imageLinks || !imageLinks.thumbnail) {
	  return DEFAULT_THUMBNAIL;
	}
	return imageLinks.thumbnail.replace("http://", "https://");
};

const drawListBook = async () => {
	if (searchBooks.value != "") {
	  bookContainer.style.display = "flex";
	  bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
	  const data = await getBooks(`${searchBooks.value}&maxResults=6`);
	  if (data.error) {
		bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
	  } else if (data.totalItems == 0) {
		bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
	  } else if (data.totalItems == undefined) {
		bookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
	  } else {
		bookContainer.innerHTML = data.items
		  .map(
			({ volumeInfo }) =>
			  `<div class='book' style='background: linear-gradient(` +
			  getRandomColor() +
			  `, rgba(0, 0, 0, 0));'><a href='${volumeInfo.previewLink}' target='_blank'><img class='thumbnail' src='` +
			  extractThumbnail(volumeInfo) +
			  `' alt='cover'></a><div class='book-info'><h3 class='book-title'><a href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3><div class='book-authors' onclick='updateFilter(this,"author");'>${volumeInfo.authors}</div><div class='info' onclick='updateFilter(this,"subject");' style='background-color: ` +
			  getRandomColor() +
			  `;'>` +
			  (volumeInfo.categories === undefined
				? "Others"
				: volumeInfo.categories) +
			  `</div></div></div>`
		  )
		  .join("");
	  }
	} else {
	  bookContainer.style.display = "none";
	}
  };

// Called once the page has loaded
document.addEventListener('DOMContentLoaded', function(event) {
	loadProducts();
	loadCategories();
});

// Replace this with your Sheety URL
// Make sure NOT to include the sheet name in the URL (just the project name!)
var projectUrl = 'https://api.sheety.co/2fada1f159b7c9857a741c071c839e66/productQuest';

function loadProducts() {
	fetch(projectUrl + '/products')
	.then((response) => response.json())
	.then(json => {
		this.products = json.products.sort((a, b) => {
			return a.votes < b.votes;
		})
		showAllProducts();
	});
}

function loadCategories() {
	fetch(projectUrl + '/categories')
	.then((response) => response.json())
	.then(json => {
		this.categories = json.categories;
		drawCategories();
	})
}

function drawProducts(products) {
	var template = Handlebars.compile(document.getElementById("products-template").innerHTML);

	//const data = getBooks(`${searchBooks.value}&maxResults=6`);
	//console.log(data);

	document.getElementById('products-container').innerHTML = template({
		title: this.title,
		products: products	
	});
}

function drawCategories() {
	var template = Handlebars.compile(document.getElementById("menu-template").innerHTML);
	console.log('draw ', this.products);
	document.getElementById('menu-container').innerHTML = template(this.categories);
}

function showAllProducts() {
	this.title = "All Products";
	drawProducts(this.products);
}

function showCategory(category) {
	this.title = category;
	let filteredProducts = this.products.filter(product => {
		return product.category == category;
	});
	drawProducts(filteredProducts);
}

function upvoteProduct(id) {
	let product = this.products.find(product => {
		return product.id == id;
	});
	product.votes = product.votes + 1;
	product.hasVoted = true;
	
	let headers = new Headers();
	headers.set('content-type', 'application/json');
	fetch(projectUrl + '/products/' + id, {
		method: 'PUT',
		body: JSON.stringify({ product: product }),
		headers: headers
	});
	
	showAllProducts();
}