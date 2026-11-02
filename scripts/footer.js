document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../html/cirqon-footer.html");

        if (!response.ok) {
            throw new Error("Footer failed to load");
        }

        document.getElementById("cirqon-footer-placeholder").innerHTML =
            await response.text();

    } catch (error) {
        console.error("Footer error:", error);
    }
});