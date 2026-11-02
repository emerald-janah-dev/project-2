class ExampleProduct {
    constructor() {
        this.filePath = "../html/example-product.html";
    }

    async load() {
        try {
            const response = await fetch(this.filePath);

            if (!response.ok) {
                throw new Error("Example product failed to load");
            }

            const productHTML = await response.text();

            document.querySelectorAll(".example-product-placeholder").forEach(placeholder => {
                placeholder.innerHTML = "";

                for (let i = 0; i < 5; i++) {
                    placeholder.innerHTML += productHTML;
                }
            });

        } catch (error) {
            console.error("Example product error:", error);
        }
    }
}

const exampleProduct = new ExampleProduct();

document.addEventListener("DOMContentLoaded", () => {
    exampleProduct.load();
});