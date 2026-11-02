document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("admin-login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const email = document.getElementById("admin-email").value;
            const password = document.getElementById("admin-password").value;

            if (email !== "admin@login" || password !== "admin@pass") {
                alert("Incorrect email or password. Please try again.");
                return;
            }

            window.location.href = "admin-dashboard.html";
        });
    }

    const dialog = document.getElementById("component-dialog");
    if (!dialog) return;

    const categories = [
        "Diodes",
        "Resistors",
        "Capacitors",
        "Transistors",
        "Microchips",
        "Inductors",
        "Logic gates",
        "Microcontrollers"
    ];
    let components = [
        { id: 1, partNumber: "1N4148", category: "Diodes", description: "Small-signal switching diode", package: "DO-35", price: 0.08, stock: 240 },
        { id: 2, partNumber: "10 kΩ, ¼ W", category: "Resistors", description: "Carbon film resistor, 5%", package: "Axial", price: 0.05, stock: 500 },
        { id: 3, partNumber: "100 µF, 25 V", category: "Capacitors", description: "Aluminum electrolytic capacitor", package: "Radial", price: 0.32, stock: 120 },
        { id: 4, partNumber: "2N2222A", category: "Transistors", description: "NPN general-purpose transistor", package: "TO-18", price: 0.18, stock: 85 },
        { id: 5, partNumber: "NE555", category: "Microchips", description: "Precision timer IC", package: "DIP-8", price: 0.45, stock: 64 },
        { id: 6, partNumber: "100 µH", category: "Inductors", description: "Radial power inductor", package: "Radial", price: 0.27, stock: 42 },
        { id: 7, partNumber: "74HC00", category: "Logic gates", description: "Quad 2-input NAND gate", package: "DIP-14", price: 0.38, stock: 73 },
        { id: 8, partNumber: "ATmega328P", category: "Microcontrollers", description: "8-bit AVR microcontroller", package: "DIP-28", price: 2.85, stock: 18 }
    ];
    const selectedIds = new Set();
    const pageSize = 8;
    let activeCategory = "All";
    let currentPage = 0;
    let toastTimer;

    const categoryFilters = document.getElementById("category-filters");
    const categorySelect = document.getElementById("component-category");
    const rows = document.getElementById("component-rows");
    const searchInput = document.getElementById("component-search");
    const selectAll = document.getElementById("select-all");
    const bulkActions = document.getElementById("bulk-actions");
    const selectionCount = document.getElementById("selection-count");
    const summary = document.getElementById("results-summary");
    const previousButton = document.getElementById("previous-page");
    const nextButton = document.getElementById("next-page");
    const form = document.getElementById("component-form");
    const toast = document.getElementById("toast");

    categoryFilters.innerHTML = ["All", ...categories].map((category) =>
        `<button class="filter-chip${category === activeCategory ? " active" : ""}" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === activeCategory}">${escapeHtml(category)}</button>`
    ).join("");
    categorySelect.innerHTML = categories.map((category) =>
        `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
    ).join("");

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getVisibleComponents() {
        const query = searchInput.value.trim().toLocaleLowerCase();
        return components.filter((component) => {
            const matchesCategory = activeCategory === "All" || component.category === activeCategory;
            const matchesSearch = `${component.partNumber} ${component.description}`.toLocaleLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }

    function render() {
        const filtered = getVisibleComponents();
        const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
        currentPage = Math.min(currentPage, pageCount - 1);
        const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

        rows.innerHTML = pageItems.length ? pageItems.map((component) => `
            <tr>
                <td class="check-column"><input class="row-checkbox" type="checkbox" data-id="${component.id}" aria-label="Select ${escapeHtml(component.partNumber)}"${selectedIds.has(component.id) ? " checked" : ""}></td>
                <td class="part-number">${escapeHtml(component.partNumber)}</td>
                <td><span class="category-tag">${escapeHtml(component.category)}</span></td>
                <td>${escapeHtml(component.description)}</td>
                <td>${escapeHtml(component.package)}</td>
                <td>$${Number(component.price).toFixed(2)}</td>
                <td>${Number(component.stock)}</td>
                <td><div class="row-actions">
                    <button class="text-button" type="button" data-action="edit" data-id="${component.id}">Edit</button>
                    <button class="text-button delete-text" type="button" data-action="delete" data-id="${component.id}">Delete</button>
                </div></td>
            </tr>
        `).join("") : `<tr><td class="empty-state" colspan="8">No components match your search.</td></tr>`;

        const start = filtered.length ? currentPage * pageSize + 1 : 0;
        const end = Math.min((currentPage + 1) * pageSize, filtered.length);
        summary.textContent = `Showing ${start}–${end} of ${filtered.length} components`;
        previousButton.disabled = currentPage === 0;
        nextButton.disabled = currentPage >= pageCount - 1;

        const allPageSelected = pageItems.length > 0 && pageItems.every((component) => selectedIds.has(component.id));
        const somePageSelected = pageItems.some((component) => selectedIds.has(component.id));
        selectAll.checked = allPageSelected;
        selectAll.indeterminate = somePageSelected && !allPageSelected;
        selectAll.disabled = pageItems.length === 0;

        bulkActions.hidden = selectedIds.size === 0;
        selectionCount.textContent = `${selectedIds.size} selected`;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add("visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2400);
    }

    function openForm(component) {
        form.reset();
        document.getElementById("component-id").value = component ? component.id : "";
        document.getElementById("dialog-title").textContent = component ? "Edit component" : "Add component";
        document.getElementById("part-number").value = component ? component.partNumber : "";
        document.getElementById("component-category").value = component ? component.category : categories[0];
        document.getElementById("component-description").value = component ? component.description : "";
        document.getElementById("component-package").value = component ? component.package : "";
        document.getElementById("component-price").value = component ? component.price : "";
        document.getElementById("component-stock").value = component ? component.stock : "";
        dialog.showModal();
        document.getElementById("part-number").focus();
    }

    categoryFilters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        activeCategory = button.dataset.category;
        currentPage = 0;
        categoryFilters.querySelectorAll(".filter-chip").forEach((chip) => {
            const isActive = chip === button;
            chip.classList.toggle("active", isActive);
            chip.setAttribute("aria-pressed", String(isActive));
        });
        render();
    });

    searchInput.addEventListener("input", () => {
        currentPage = 0;
        render();
    });

    rows.addEventListener("change", (event) => {
        if (!event.target.matches(".row-checkbox")) return;
        const id = Number(event.target.dataset.id);
        if (event.target.checked) selectedIds.add(id);
        else selectedIds.delete(id);
        render();
    });

    rows.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const component = components.find((item) => item.id === Number(button.dataset.id));
        if (!component) return;

        if (button.dataset.action === "edit") {
            openForm(component);
            return;
        }

        if (window.confirm(`Delete ${component.partNumber}?`)) {
            components = components.filter((item) => item.id !== component.id);
            selectedIds.delete(component.id);
            render();
            showToast("Component deleted.");
        }
    });

    selectAll.addEventListener("change", () => {
        const pageItems = getVisibleComponents().slice(currentPage * pageSize, (currentPage + 1) * pageSize);
        pageItems.forEach((component) => {
            if (selectAll.checked) selectedIds.add(component.id);
            else selectedIds.delete(component.id);
        });
        render();
    });

    document.getElementById("delete-selected-button").addEventListener("click", () => {
        if (!selectedIds.size || !window.confirm(`Delete ${selectedIds.size} selected components?`)) return;
        components = components.filter((component) => !selectedIds.has(component.id));
        selectedIds.clear();
        render();
        showToast("Selected components deleted.");
    });

    document.getElementById("add-component-button").addEventListener("click", () => openForm(null));
    document.getElementById("close-dialog-button").addEventListener("click", () => dialog.close());
    document.getElementById("cancel-dialog-button").addEventListener("click", () => dialog.close());

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const idValue = document.getElementById("component-id").value;
        const component = {
            id: idValue ? Number(idValue) : Date.now(),
            partNumber: document.getElementById("part-number").value.trim(),
            category: categorySelect.value,
            description: document.getElementById("component-description").value.trim(),
            package: document.getElementById("component-package").value.trim(),
            price: Number(document.getElementById("component-price").value),
            stock: Number(document.getElementById("component-stock").value)
        };

        const existingIndex = components.findIndex((item) => item.id === component.id);
        if (existingIndex >= 0) {
            components[existingIndex] = component;
            showToast("Component updated.");
        } else {
            components.unshift(component);
            showToast("Component added.");
        }
        activeCategory = "All";
        currentPage = 0;
        categoryFilters.querySelectorAll(".filter-chip").forEach((chip) => {
            const isActive = chip.dataset.category === activeCategory;
            chip.classList.toggle("active", isActive);
            chip.setAttribute("aria-pressed", String(isActive));
        });
        dialog.close();
        render();
    });

    previousButton.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage -= 1;
            render();
        }
    });

    nextButton.addEventListener("click", () => {
        if ((currentPage + 1) * pageSize < getVisibleComponents().length) {
            currentPage += 1;
            render();
        }
    });

    render();

    const managedSections = {
        "top-sales": {
            title: "Top Sales",
            description: "Track your best-selling products and sales performance.",
            addLabel: "+ Add sales record",
            fields: [
                { key: "product", label: "Product", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "unitsSold", label: "Units sold", type: "number", min: 0 },
                { key: "revenue", label: "Revenue (USD)", type: "number", min: 0, step: "0.01", format: "currency" }
            ],
            records: [
                { id: 101, product: "ATmega328P", category: "Microcontrollers", unitsSold: 84, revenue: 239.40 },
                { id: 102, product: "1N4148", category: "Diodes", unitsSold: 72, revenue: 5.76 },
                { id: 103, product: "NE555", category: "Microchips", unitsSold: 58, revenue: 26.10 }
            ]
        },
        news: {
            title: "News",
            description: "Create and manage announcements shown to your customers.",
            addLabel: "+ Add news",
            fields: [
                { key: "headline", label: "Headline", type: "text" },
                { key: "category", label: "Category", type: "text" },
                { key: "status", label: "Status", type: "select", options: ["Draft", "Published"] },
                { key: "publishDate", label: "Publish date", type: "date" }
            ],
            records: [
                { id: 201, headline: "New components just arrived", category: "Store update", status: "Published", publishDate: "2026-10-20" },
                { id: 202, headline: "Electronics workshop this month", category: "Events", status: "Draft", publishDate: "2026-11-05" }
            ]
        },
        courses: {
            title: "Free Courses",
            description: "Manage free learning courses available to your customers.",
            addLabel: "+ Add course",
            fields: [
                { key: "course", label: "Course name", type: "text" },
                { key: "instructor", label: "Instructor", type: "text" },
                { key: "level", label: "Level", type: "select", options: ["Beginner", "Intermediate", "Advanced"] },
                { key: "students", label: "Students", type: "number", min: 0 },
                { key: "status", label: "Status", type: "select", options: ["Draft", "Published"] }
            ],
            records: [
                { id: 301, course: "Electronics Fundamentals", instructor: "CirqOn Team", level: "Beginner", students: 128, status: "Published" },
                { id: 302, course: "Getting Started with Arduino", instructor: "CirqOn Team", level: "Beginner", students: 96, status: "Published" },
                { id: 303, course: "Understanding Resistors", instructor: "M. Santos", level: "Intermediate", students: 42, status: "Draft" }
            ]
        }
    };
    const storageKey = "cirqon-admin-content-v1";
    let activeSection = null;
    let managedRecords = {};
    let activeRecordFields = [];

    function loadManagedRecords() {
        try {
            const saved = window.localStorage.getItem(storageKey);
            if (saved === null) {
                return Object.fromEntries(
                    Object.entries(managedSections).map(([key, section]) => [key, section.records])
                );
            }

            const parsed = JSON.parse(saved);
            for (const key of Object.keys(managedSections)) {
                if (!Array.isArray(parsed[key])) {
                    throw new Error(`Saved ${key} records are not a list.`);
                }
            }
            return parsed;
        } catch (error) {
            console.error("Could not load admin content from browser storage.", error);
            showToast("Saved content could not be loaded. Showing sample records.");
            return Object.fromEntries(
                Object.entries(managedSections).map(([key, section]) => [key, section.records])
            );
        }
    }

    function persistManagedRecords() {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(managedRecords));
            return true;
        } catch (error) {
            console.error("Could not save admin content to browser storage.", error);
            showToast("Changes could not be saved in this browser.");
            return false;
        }
    }

    managedRecords = loadManagedRecords();

    const manager = document.getElementById("content-manager");
    const componentsView = document.getElementById("components-view");
    const managerTitle = document.getElementById("manager-title");
    const managerDescription = document.getElementById("manager-description");
    const recordHead = document.getElementById("record-head");
    const recordRows = document.getElementById("record-rows");
    const recordSummary = document.getElementById("record-summary");
    const recordSearch = document.getElementById("record-search");
    const recordDialog = document.getElementById("record-dialog");
    const recordForm = document.getElementById("record-form");
    const recordFields = document.getElementById("record-fields");

    function renderManagedRecords() {
        const section = managedSections[activeSection];
        const query = recordSearch.value.trim().toLocaleLowerCase();
        const records = managedRecords[activeSection].filter((record) =>
            Object.values(record).some((value) => String(value).toLocaleLowerCase().includes(query))
        );

        recordHead.innerHTML = `<tr>${section.fields.map((field) => `<th>${escapeHtml(field.label)}</th>`).join("")}<th>Actions</th></tr>`;
        recordRows.innerHTML = records.length ? records.map((record) => `
            <tr>
                ${section.fields.map((field) => {
                    const value = record[field.key];
                    const displayValue = field.format === "currency" ? `$${Number(value).toFixed(2)}` : value;
                    return `<td>${escapeHtml(displayValue ?? "")}</td>`;
                }).join("")}
                <td><div class="row-actions">
                    <button class="text-button" type="button" data-record-action="edit" data-id="${record.id}">Edit</button>
                    <button class="text-button delete-text" type="button" data-record-action="delete" data-id="${record.id}">Delete</button>
                </div></td>
            </tr>
        `).join("") : `<tr><td class="empty-state" colspan="${section.fields.length + 1}">No records found.</td></tr>`;
        recordSummary.textContent = `Showing ${records.length} ${records.length === 1 ? "record" : "records"}`;
    }

    function openRecordForm(record) {
        const section = managedSections[activeSection];
        activeRecordFields = section.fields;
        recordForm.reset();
        document.getElementById("record-id").value = record ? record.id : "";
        document.getElementById("record-dialog-title").textContent = record ? `Edit ${section.title.toLowerCase()} record` : section.addLabel.replace(/^\+\s*/, "");
        recordFields.innerHTML = section.fields.map((field) => {
            const value = record ? record[field.key] : "";
            const control = field.type === "select"
                ? `<select name="${field.key}" required>${field.options.map((option) => `<option value="${escapeHtml(option)}"${value === option ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`
                : `<input name="${field.key}" type="${field.type}"${field.min !== undefined ? ` min="${field.min}"` : ""}${field.step ? ` step="${field.step}"` : ""} required${field.type === "text" ? ' maxlength="120"' : ""} value="${escapeHtml(value)}">`;
            return `<label>${escapeHtml(field.label)}${control}</label>`;
        }).join("");
        recordDialog.showModal();
        recordFields.querySelector("input, select")?.focus();
    }

    function setAdminView(viewName) {
        const isComponents = viewName === "components";
        const section = managedSections[viewName];
        if (!isComponents && !section) return;

        componentsView.hidden = !isComponents;
        manager.hidden = isComponents;
        document.querySelectorAll("[data-admin-view]").forEach((link) => {
            const isActive = link.dataset.adminView === viewName;
            link.classList.toggle("active", isActive);
            if (isActive) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });

        if (isComponents) {
            activeSection = null;
            document.getElementById("page-title").textContent = "Components";
            return;
        }

        activeSection = viewName;
        managerTitle.textContent = section.title;
        managerDescription.textContent = section.description;
        document.getElementById("add-record-button").textContent = section.addLabel;
        recordSearch.value = "";
        recordSearch.placeholder = `Search ${section.title.toLocaleLowerCase()}`;
        renderManagedRecords();
    }

    document.querySelector(".main-nav").addEventListener("click", (event) => {
        const link = event.target.closest("[data-admin-view]");
        if (!link) return;
        event.preventDefault();
        const viewName = link.dataset.adminView;
        history.replaceState(null, "", `#${viewName}`);
        setAdminView(viewName);
    });

    document.getElementById("add-record-button").addEventListener("click", () => openRecordForm(null));
    document.getElementById("close-record-dialog").addEventListener("click", () => recordDialog.close());
    document.getElementById("cancel-record-dialog").addEventListener("click", () => recordDialog.close());
    recordSearch.addEventListener("input", renderManagedRecords);

    recordRows.addEventListener("click", (event) => {
        const button = event.target.closest("[data-record-action]");
        if (!button || !activeSection) return;
        const records = managedRecords[activeSection];
        const record = records.find((item) => item.id === Number(button.dataset.id));
        if (!record) return;

        if (button.dataset.recordAction === "edit") {
            openRecordForm(record);
            return;
        }

        if (!window.confirm(`Delete "${record[managedSections[activeSection].fields[0].key]}"?`)) return;
        managedRecords[activeSection] = records.filter((item) => item.id !== record.id);
        const saved = persistManagedRecords();
        renderManagedRecords();
        if (saved) showToast("Record deleted.");
    });

    recordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!recordForm.reportValidity() || !activeSection) return;

        const idValue = document.getElementById("record-id").value;
        const record = { id: idValue ? Number(idValue) : Date.now() };
        for (const field of activeRecordFields) {
            const value = new FormData(recordForm).get(field.key);
            record[field.key] = field.type === "number" ? Number(value) : String(value).trim();
        }

        const records = managedRecords[activeSection];
        const existingIndex = records.findIndex((item) => item.id === record.id);
        if (existingIndex >= 0) {
            records[existingIndex] = record;
        } else {
            records.unshift(record);
        }
        const saved = persistManagedRecords();
        recordDialog.close();
        renderManagedRecords();
        if (saved) showToast(existingIndex >= 0 ? "Record updated." : "Record added.");
    });

    const initialView = window.location.hash.slice(1);
    if (initialView && initialView !== "components") setAdminView(initialView);
});
