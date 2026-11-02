document.addEventListener("DOMContentLoaded", async () => {
    try {
        // LOAD HEADER
        const headerResponse = await fetch("../html/cirqon-header.html");

        if (!headerResponse.ok) throw new Error("Header failed to load");

        document.getElementById("cirqon-header-placeholder").innerHTML =
            await headerResponse.text();

        // Disable Store link
        if (location.pathname.endsWith("shop-page.html")) {
            document.getElementById("store")?.classList.add("disabled");
        }

        if (location.pathname.endsWith("cart-page.html")) {
            document.getElementById("cart-btn")?.classList.add("disabled");
        }

        if (location.pathname.endsWith("order-page.html")) {
            document.getElementById("cart-btn")?.classList.add("disabled");
        }

        // LOAD CART SIDEBAR
        const sidebarResponse = await fetch("../html/cirqon-sidebar.html");

        if (!sidebarResponse.ok) throw new Error("Sidebar failed to load");

        document.getElementById("cirqon-cart-placeholder").innerHTML =
            await sidebarResponse.text();

        // INITIALIZE
        initializeSidebar();
        updateEmptyCartMessage();
        updateShopCartTotal();

    } catch (error) {
        console.error("Component loading error:", error);
    }
});

