
document.addEventListener("DOMContentLoaded", function () {
    async function loadProduct() {
        try {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get("id");

            const response = await fetch(`http://localhost:3000/api/products/${productId}`);

            if (!response.ok) {
                throw new Error("Failed to retrieve product information.");
            }

            const product = await response.json();

            document.getElementById("part_number").textContent = product.part_number;
            document.getElementById("information").textContent = product.information;
            document.getElementById("manufacturer").textContent = product.manufacturer;
            document.getElementById("mounting_type").textContent = product.mounting_type;
            document.getElementById("part_status").textContent = product.part_status;
            document.getElementById("stock").textContent = product.stock;
            document.getElementById("price").textContent = Number(product.price).toFixed(2);

            const datasheetLink = document.getElementById("datasheet");
            datasheetLink.href = product.datasheet;

            const productImage = document.getElementById("product_image");
            productImage.src = "../img/products/" + product.image;
            productImage.alt = product.part_number;

            // PRODUCT ATTRIBUTES
            const attributesBody = document.getElementById("attributes-body");

            attributesBody.innerHTML = "";

            const groupedAttributes = {};

            product.attributes.forEach(attribute => {
                if (!groupedAttributes[attribute.attribute_name]) {
                    groupedAttributes[attribute.attribute_name] = [];
                }

                groupedAttributes[attribute.attribute_name].push(attribute.attribute_value);
            });

            for (const attributeName in groupedAttributes) {
                const row = document.createElement("tr");
                const heading = document.createElement("th");
                const value = document.createElement("td");

                heading.textContent = attributeName;

                groupedAttributes[attributeName].forEach((item, index) => {
                    if (index > 0) {
                        value.appendChild(document.createElement("br"));
                    }

                    value.appendChild(document.createTextNode(item));
                });

                row.appendChild(heading);
                row.appendChild(value);

                attributesBody.appendChild(row);
            }

            // ADD TO CART
            const addToCartButton = document.getElementById("add-to-cart-btn");

            addToCartButton.addEventListener("click", function (event) {
                addToCart(event, {
                    name: product.part_number,
                    image: "../img/products/" + product.image,
                    price: Number(product.price)
                });
            });

        } catch (error) {
            console.error("Error loading product:", error);
        }
    }

    loadProduct();
});



const addToCartButton = document.getElementById("add-to-cart-btn");

addToCartButton.addEventListener("click", function(event) {
    addToCart(event, {
        name: product.part_number,
        image: "../img/diode-1.png",
        price: Number(product.price)
    });
});

function copyPartNumber() {
    const partNumber = document.querySelector(".part-number h2").textContent;
    const button = document.querySelector(".copy-btn");

    navigator.clipboard.writeText(partNumber).then(() => {
        button.classList.add("copied");

        setTimeout(() => {
            button.classList.remove("copied");
        }, 1500);

    }).catch(() => {
        console.error("Failed to copy part number.");
    });
}

function changeQuantity(amount) {
    const quantityInput = document.getElementById("quantity");

    if (!quantityInput) return;

    const current = Number(quantityInput.value) || 1;
    const min = Number(quantityInput.min) || 1;
    const max = Number(quantityInput.max) || Infinity;

    quantityInput.value = Math.max(
        min,
        Math.min(max, current + amount)
    );
}

function getShopCartItems() {
    return document.getElementById("cart-items");
}