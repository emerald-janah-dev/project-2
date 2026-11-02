
//function to scroll the product display left or right. wah.
    function scrollProducts(direction) {
        const display = document.getElementById("productDisplay");

        display.scrollBy({
            left: direction * 428,
            behavior: "smooth"
        });
    }