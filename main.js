// Wait for page to load
document.addEventListener('DOMContentLoaded', function(event) {
	ready();
})

function ready() {
	let url = 'https://api.sheety.co/2fada1f159b7c9857a741c071c839e66/youflix/videos';
	fetch(url)
	.then((response) => response.json())
	.then(json => {
		let videos = json.videos;
		// Parse out YouTube ID from the URL, as we'll use that to get the thumbnail
		videos.forEach(video => {
			let regex = /watch\?v=([\w\d-]*)/;
			video.youtubeID = video.url.match(regex)[1];
		});
		
		let featuredVideo = videos.find(video => {
			return video.isFeatured;
		});
	
		let groupedVideos = _.groupBy(json.videos, 'category');
		var template = Handlebars.compile(document.getElementById("app-template").innerHTML);
		// Render items into Handlebars template, and set the html of the container element
		document.getElementById('app').innerHTML = template({
			featured: featuredVideo,
			videos: groupedVideos
		});
	});
}

var products = null;
var categories = null;
var title = null;

// Called once the page has loaded
document.addEventListener('DOMContentLoaded', function(event) {
	loadProducts();
	loadCategories();
});

// Replace this with your Sheety URL
// Make sure NOT to include the sheet name in the URL (just the project name!)
var projectUrl = 'https://api.sheety.co/2fada1f159b7c9857a741c071c839e66/productQuest/products';

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