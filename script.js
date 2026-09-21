let cart = [];

function addToCart(productName, price) {
    let existingProduct = cart.find(function(item) {
        return item.name === productName;
    });

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    updateCart();
}

function updateCart() {
    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(function(item) {
            let itemElement = document.createElement("p");

            itemElement.textContent =
                item.name + " - ₹" + item.price;

            cartItems.appendChild(itemElement);

            total += item.price;
        });
    }

    cartTotal.textContent = total;
}

function showDetails(productName, price) {
    alert(
        "Product Details\n\n" +
        "Product: " + productName +
        "\nPrice: ₹" + price +
        "\n\nThis product is available in CodeAlpha Store."
    );
}

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "" || password === "") {
        alert("Please enter username and password");
        return;
    }

    try {
        let response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        let data = await response.json();

        alert(data.message);

    } catch (error) {
        alert("Server connection failed");
    }
}
async function registerUser() {
    let username = document.getElementById("register-username").value;
    let password = document.getElementById("register-password").value;

    if (username === "" || password === "") {
        alert("Please enter username and password");
        return;
    }

    try {
        let response = await fetch("http://localhost:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        let data = await response.json();

        alert(data.message);

    } catch (error) {
        alert("Server connection failed");
    }
}
async function placeOrder() {

    if (cart.length === 0) {
        alert("Your cart is empty");
        return;
    }

    let username = document.getElementById("username").value;

    if (username === "") {
        alert("Please login before placing an order");
        return;
    }

    let total = 0;

    cart.forEach(function(item) {
        total += item.price;
    });

    try {

        let response = await fetch("http://localhost:3000/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                total: total
            })
        });

        let data = await response.json();

        alert(data.message);

        if (response.ok) {
            cart = [];
            updateCart();
        }

    } catch (error) {

        alert("Server connection failed");

    }
}
function searchProducts() {
    let searchText = document.getElementById("search").value.toLowerCase();

    let products = document.querySelectorAll(".product");

    products.forEach(function(product) {
        let productName = product.querySelector("h3").textContent.toLowerCase();

        if (productName.includes(searchText)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}