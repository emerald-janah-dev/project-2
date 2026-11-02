
// SIDEBAR
function initializeSidebar() {
    const cart = document.getElementById("cart-btn");
    const cartContainer = document.getElementById("cart-container");
    const closeContainer = document.getElementById("close-cart-container");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    // Stop if the required elements are missing
    if (!cart || !cartContainer || !closeContainer || !sidebar || !overlay) {
        return;
    }

    function openSidebar() {
        sidebar.classList.add("active");
        overlay.classList.add("active");

        closeContainer.appendChild(cart);
        cart.setAttribute("aria-label", "Close shopping basket");
    }

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");

        cartContainer.appendChild(cart);
        cart.setAttribute("aria-label", "Open shopping basket");
    }

    cart.addEventListener("click", function (event) {
        event.preventDefault();

        if (sidebar.classList.contains("active")) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    overlay.addEventListener("click", closeSidebar);
}


function updateEmptyCartMessage() {
    const cartItems = getShopCartItems();
    const emptyMessage = document.getElementById("empty-cart");

    if (!cartItems || !emptyMessage) return;

    const hasItems = cartItems.querySelector(".cart-item-shop") !== null;

    emptyMessage.style.display = hasItems ? "none" : "block";
}

function updateShopCartTotal() {
    let total = 0;

    document.querySelectorAll("#cart-items .cart-item-shop").forEach(item => {
        const checkbox = item.querySelector(".cart-item-checkbox");
        const priceElement = item.querySelector(".cart-item-price");
        const quantityInput = item.querySelector(".quantity-input");

        if (!checkbox || !priceElement || !quantityInput) return;

        const price = Number(priceElement.dataset.price);
        const quantity = Math.max(
            1,
            Math.floor(Number(quantityInput.value) || 1)
        );

        if (checkbox.checked) {
            total += price * quantity;
        }
    });

    // The sidebar total uses this ID in your existing HTML.
    const totalElement = document.getElementById("cart-total");

    if (totalElement && getShopCartItems()) {
        totalElement.textContent = `Total: ₱${total.toFixed(2)}`;
    }
}

function addToCart(event, product) {
    if (!product) return;

    const button = event ? event.currentTarget : null;

    // Add-to-cart button animation
    if (button) {
        button.classList.remove("clicked");
        void button.offsetWidth;
        button.classList.add("clicked");

        setTimeout(() => {
            button.classList.remove("clicked");
        }, 1200);
    }

    const cartItems = getShopCartItems();

    if (!cartItems) {
        console.error("Cannot find the #cart-items container.");
        return;
    }

    const productPrice = Number(product.price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
        console.error("Invalid product price:", product.price);
        return;
    }

    // Check whether the product is already in the cart
    const existingItem = [
        ...cartItems.querySelectorAll(".cart-item-shop")
    ].find(item => item.dataset.name === product.name);

    if (existingItem) {
        const quantityInput = existingItem.querySelector(".quantity-input");

        quantityInput.value = (Number(quantityInput.value) || 1) + 1;

        updateShopItemSubtotal(existingItem);
        updateShopCartTotal();
        updateEmptyCartMessage();

        return;
    }

    // Create the new cart item
    const item = document.createElement("div");

    item.className = "cart-item-shop";
    item.dataset.name = product.name;

    item.innerHTML = `
        <input type="checkbox" class="cart-item-checkbox"
            aria-label="Select ${product.name}">

        <img src="${product.image}" alt="${product.name}">

        <div class="cart-item-details">
            <p><strong>${product.name}</strong></p>

            <p class="cart-item-price"
            data-price="${productPrice}">
                ₱${productPrice.toFixed(2)}
            </p>

            <div class="quantity-control-shop">
                <button type="button" class="quantity-minus"
                        aria-label="Decrease quantity">−</button>

                <input type="number" class="quantity-input"
                    value="1" min="1" step="1"
                    aria-label="${product.name} quantity">

                <button type="button" class="quantity-plus"
                        aria-label="Increase quantity">+</button>
            </div>

            <p class="cart-item-subtotal">
                Subtotal: ₱${productPrice.toFixed(2)}
            </p>
        </div>

        <button class="remove-item-shop"
                aria-label="Remove ${product.name}"
                type="button">
            <img src="../img/design/delete.png" alt="">
        </button>
    `;

    // Add the item before attaching the total calculation events
    cartItems.appendChild(item);

    const checkbox = item.querySelector(".cart-item-checkbox");
    const quantityInput = item.querySelector(".quantity-input");

    // Update totals when selecting or deselecting a product
    checkbox.addEventListener("change", updateShopCartTotal);

    // Increase quantity
    item.querySelector(".quantity-plus").addEventListener("click", () => {
        quantityInput.value = (Number(quantityInput.value) || 1) + 1;

        updateShopItemSubtotal(item);
        updateShopCartTotal();
    });

    // Decrease quantity
    item.querySelector(".quantity-minus").addEventListener("click", () => {
        quantityInput.value = Math.max(
            1,
            (Number(quantityInput.value) || 1) - 1
        );

        updateShopItemSubtotal(item);
        updateShopCartTotal();
    });

    // Allow manually entering a quantity
    quantityInput.addEventListener("change", () => {
        quantityInput.value = Math.max(
            1,
            Math.floor(Number(quantityInput.value) || 1)
        );

        updateShopItemSubtotal(item);
        updateShopCartTotal();
    });

    quantityInput.addEventListener("input", updateShopCartTotal);

    // Remove product
    item.querySelector(".remove-item-shop").addEventListener("click", () => {
        item.remove();

        updateEmptyCartMessage();
        updateShopCartTotal();
    });

    updateEmptyCartMessage();
    updateShopCartTotal();
}


function updateShopItemSubtotal(item) {
    if (!item) return;

    const priceElement = item.querySelector(".cart-item-price");
    const quantityInput = item.querySelector(".quantity-input");
    const subtotalElement = item.querySelector(".cart-item-subtotal");

    if (!priceElement || !quantityInput || !subtotalElement) return;

    const price = Number(priceElement.dataset.price);
    const quantity = Math.max(
        1,
        Math.floor(Number(quantityInput.value) || 1)
    );

    quantityInput.value = quantity;

    subtotalElement.textContent =
        `Subtotal: ₱${(price * quantity).toFixed(2)}`;
}

function formatCheckoutPrice(value) {
    return "$ " + value.toFixed(2);
}

function updateCheckoutTotal() {
    let subtotal = 0;

    document.querySelectorAll(".cart-products .cart-item").forEach(item => {
        const price = Number(item.dataset.price);
        const quantityInput = item.querySelector(
            ".quantity-control input"
        );
        const subtotalElement = item.querySelector(".product-subtotal");

        if (!quantityInput || !subtotalElement) return;

        const quantity = Math.max(
            0,
            Math.floor(Number(quantityInput.value) || 0)
        );

        quantityInput.value = quantity;

        const itemTotal = price * quantity;

        subtotalElement.textContent = formatCheckoutPrice(itemTotal);

        subtotal += itemTotal;
    });

    const shippingInput = document.querySelector(
        '.cart-summary input[name="shipping"]:checked'
    );

    const shipping = shippingInput
        ? Number(shippingInput.value)
        : 0;

    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");

    // Update checkout amounts only when the checkout table exists.
    if (document.querySelector(".cart-products")) {
        if (subtotalElement) {
            subtotalElement.textContent = formatCheckoutPrice(subtotal);
        }

        if (totalElement) {
            totalElement.textContent =
                formatCheckoutPrice(subtotal + shipping);
        }
    }
}

const checkoutProducts = document.querySelector(".cart-products");

if (checkoutProducts) {
    checkoutProducts.addEventListener("click", event => {
        const item = event.target.closest(".cart-item");

        if (!item) return;

        const input = item.querySelector(".quantity-control input");

        if (!input) return;

        if (event.target.closest(".plus")) {
            input.value = (Number(input.value) || 0) + 1;
            updateCheckoutTotal();
        }

        if (event.target.closest(".minus")) {
            input.value = Math.max(
                0,
                (Number(input.value) || 0) - 1
            );

            updateCheckoutTotal();
        }

        if (event.target.closest(".remove-item")) {
            item.remove();
            updateCheckoutTotal();
        }
    });

    checkoutProducts.addEventListener("input", event => {
        if (event.target.matches(".quantity-control input")) {
            updateCheckoutTotal();
        }
    });
}

document.querySelectorAll(
    '.cart-summary input[name="shipping"]'
).forEach(input => {
    input.addEventListener("change", updateCheckoutTotal);
});


// Initialize the checkout table if it exists.
if (document.querySelector(".cart-products")) {
    updateCheckoutTotal();
}
