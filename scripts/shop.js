function getProductContainer(product) {
    const category = product.category?.toLowerCase();
    const subcategory = product.subcategory?.toLowerCase();

    const containers = {
        "diodes": {
            "general purpose": "general-products",
            "zener": "zener-products",
            "schottky": "schottky-products",
            "rectifier": "rectifier-products",
            "photodiode": "photodiode-products",
            "laser diode": "laser-products"
        },

        "resistors": {
            // Add resistor subcategories here
            "carbon-film": "carbon-products",
            "metal-film": "metal-products",
            "variable": "variable-products",
            "wire wound": "wire-products",
            "surface mount": "mount-products",
            "resistor array": "array-products"
        },

        "capacitors": {
            // Add capacitor subcategories here
            "ceramic": "ceramic-products",
            "electrolytic": "electrolytic-products",
            "variable": "c-variable-products",
            "supercapacitor": "supercapacitor-products",
            "film": "film-products",
            "tantalum": "tantalum-products"
        },

        "transistors": {
            // Add transistor subcategories here
            "bipolar junction": "bipolar-products",
            "jfet": "jfet-products",
            "mosfet": "mosfet-products",
            "phototransistor": "phototransistor-products",
            "igbt": "igbt-products",
            "power transistor": "power-products"
        },

        "microchips": {
            // Add microchip subcategories here
            "logic chip": "logic-products",
            "memory chip": "memory-products",
            "asic": "asic-products",
            "soc": "soc-products",
            "analog chip": "analog-products",
            "digital chip": "digital-products"
        },

        "inductors": {
            // Add inductor subcategories here
            "wire wound": "wound-products",
            "multilayer": "multilayer-products",
            "radio-frequency": "radio-products",
            "variable": "i-variable-products", 
            "choke inductor": "choke-products", 
            "coupled inductor": "coupled-products"
        },

        "logic-gates": {
            // Add logic gate subcategories here
            "cmos": "cmos-products",
            "nmos": "nmos-products",
            "pmos": "pmos-products",
            "ttl": "ttl-products",
            "cml": "cml-products",
            "ecl": "ecl-products"
        },

        "microcontrollers": {
            // Add microcontroller subcategories here
            "arm" : "arm-products",
            "pic" : "pic-products",
            "avr" : "avr-products",
            "esp32/esp8266" : "esp-products",
            "rp2040" : "rp-products",
            "stm32" : "stm-products"
        }
    };

    const containerId = containers[category]?.[subcategory];

    return containerId ? document.getElementById(containerId) : null;
}


async function loadShopProducts() {
    try {
        const response = await fetch("http://localhost:3000/api/products");

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const products = await response.json();

        document.querySelectorAll(".category-content [id$='-products']").forEach(container => {
            container.innerHTML = "";
        });

        products.forEach(product => {

            const container = getProductContainer(product);

            if (!container) return;

            const productCard = document.createElement("div");

            productCard.className = "component-1";

            productCard.innerHTML = `
                <div class="img">
                    <img src="../img/products/${product.image}" alt="${product.part_number}">
                </div>

                <div class="column-1">
                    <a href="${product.datasheet}" 
                        target="_blank"
                        onclick="event.stopPropagation()">
                        <img src="../img/design/component-link.png" alt="Datasheet">
                    </a>

                    <p class="component-name">${product.part_number}</p>
                    <p class="manufacturer">${product.manufacturer}</p>
                </div>

                <div class="column-2">
                    <p>${product.first}</p>
                    <p>${product.second}</p>
                    <p>Part Status: ${product.part_status}</p>
                </div>

                <div class="column-3">
                    <p>Price: $ ${Number(product.price).toFixed(2)}</p>
                </div>

                <div class="column-4">
                    <p>Stock: ${product.stock} pcs</p>
                </div>

                <div class="column-5">
                    <button class="add-cart-btn" onclick="event.stopPropagation()">
                        <img src="../img/design/shop.png" alt="Add to cart">
                    </button>
                </div>
            `;

            productCard.onclick = function () {
                window.location.href = `product-page.html?id=${product.product_id}`;
            };

            container.appendChild(productCard);

        });

    } catch (error) {
        console.error("Error fetching shop products:", error);
    }
}



document.addEventListener("DOMContentLoaded", async () => {

    // Load products
    loadShopProducts();

    // Load store navigation
    try {
        const response = await fetch("../html/cirqon-store-nav.html");

        if (!response.ok) {
            throw new Error("Store navigation failed to load");
        }

        document.getElementById("cirqon-storenav-placeholder").innerHTML =
            await response.text();

        // Disable search bar on product page
        if (location.pathname.endsWith("product-page.html")) {
            document.querySelector(".search-bar-display")?.classList.add("disabled");
        }

        if (location.pathname.endsWith("cart-page.html")) {
            document.querySelector(".search-bar-display")?.classList.add("disabled");
        }

        if (location.pathname.endsWith("checkout-page.html")) {
            document.querySelector(".search-bar-display")?.classList.add("disabled");
        }

        if (window.location.pathname.endsWith("cart-page.html")) {
        document.querySelector(".img-display")?.classList.add("transparent");
        document.querySelector(".store-name")?.classList.add("transparent");
        }

        if (window.location.pathname.endsWith("checkout-page.html")) {
        document.querySelector(".img-display")?.classList.add("transparent");
        document.querySelector(".store-name")?.classList.add("transparent");
        }

    } catch (error) {
        console.error("Store navigation error:", error);
    }

});

function showCategory(category, button) {
    document.querySelectorAll('.category-content').forEach(section => {
        section.hidden = true;
    });

    document.getElementById(category).hidden = false;

    document.querySelectorAll('.components .buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');
}

// Select the correct category when shop.html loads
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "diodes";

    const button = document.querySelector(
        `.components .buttons button[onclick*="'${category}'"]`
    );

    if (button && document.getElementById(category)) {
        showCategory(category, button);
    }
});

document.querySelectorAll(".add-cart-btn").forEach(button => {
    button.addEventListener("click", function () {
        // Prevent repeated clicks during the animation
        if (button.disabled) return;

        button.disabled = true;

        // Replace the shopping icon with a check mark
        button.innerHTML = '<span class="check"><img src="img/check.png" alt="Add to cart"></span>';

        // Return to the original appearance after 1 second
        setTimeout(() => {
            button.innerHTML = '<img src="img/shop.png" alt="Add to cart">';
            button.disabled = false;
        }, 1000);
    });
});

function showDiodeType(type, button) {
    document.querySelectorAll("#diodes .diode-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#diodes .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showResistorType(type, button) {
    document.querySelectorAll("#resistors .resistor-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#resistors .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showCapacitorType(type, button) {
    document.querySelectorAll("#capacitors .capacitor-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#capacitors .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showTransistorType(type, button) {
    document.querySelectorAll("#transistors .transistor-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#transistors .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showMicrochipsType(type, button) {
    document.querySelectorAll("#microchips .microchip-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#microchips .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showInductorType(type, button) {
    document.querySelectorAll("#inductors .inductor-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#inductors .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showLogicType(type, button) {
    document.querySelectorAll("#logic-gates .logic-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#logic-gates .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}

function showMicrocontrollerType(type, button) {
    document.querySelectorAll("#microcontrollers .microcontroller-type").forEach(section => {
        section.hidden = true;
    });

    document.getElementById(type).hidden = false;

    document.querySelectorAll("#microcontrollers .displayed-nav button").forEach(btn => {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");
}