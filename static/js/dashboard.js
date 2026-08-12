const categorySelect = document.getElementById("category-select");
const addCategoryModalEl = document.getElementById("addCategoryModal");
const addCategoryModal = new bootstrap.Modal(addCategoryModalEl);
const addCategoryErrors = document.getElementById("addCategoryErrors");
let lastValidCategory = categorySelect.value;

categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "__new__") {
        categorySelect.value = lastValidCategory;
        addCategoryErrors.innerHTML = "";
        addCategoryModal.show();
    } else {
        lastValidCategory = categorySelect.value;
    }
});

addCategoryModalEl.addEventListener("shown.bs.modal", () => {
    addCategoryModalEl.querySelector('input[name="name"]').focus();
});

if (addCategoryModalEl.dataset.showModal === "true") {
    addCategoryModal.show();
}

const editEmojiModalEl = document.getElementById("editEmojiModal");
const editEmojiModal = new bootstrap.Modal(editEmojiModalEl);
const editEmojiForm = document.getElementById("editEmojiForm");
const editEmojiInput = document.getElementById("editEmojiInput");
const editEmojiPreview = document.getElementById("editEmojiPreview");
const editEmojiPicker = document.getElementById("editEmojiPicker");

document.querySelectorAll(".edit-emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        editEmojiForm.action = btn.dataset.editUrl;
        editEmojiInput.value = btn.dataset.currentEmoji;
        editEmojiPreview.textContent = btn.dataset.currentEmoji || "🏷️";
        editEmojiPicker.classList.add("d-none");
        editEmojiModal.show();
    });
});

editEmojiModalEl.addEventListener("shown.bs.modal", () => {
    editEmojiPreview.focus();
});

wireEmojiPicker(
    document.getElementById("addEmojiPreview"),
    document.getElementById("addEmojiInput"),
    document.getElementById("addEmojiPicker")
);

wireEmojiPicker(editEmojiPreview, editEmojiInput, editEmojiPicker);

const editExpenseModalEl = document.getElementById("editExpenseModal");
const editExpenseModal = new bootstrap.Modal(editExpenseModalEl);
const editExpenseForm = document.getElementById("editExpenseForm");
const editExpenseErrors = document.getElementById("editExpenseErrors");
const editExpenseAmount = document.getElementById("editExpenseAmount");
const editExpenseCategory = document.getElementById("editExpenseCategory");
const editExpenseDate = document.getElementById("editExpenseDate");
const editExpenseDescription = document.getElementById("editExpenseDescription");

function fillEditExpenseModal(btn) {
    editExpenseForm.action = btn.dataset.editUrl;
    editExpenseAmount.value = btn.dataset.amount;
    editExpenseCategory.value = btn.dataset.category;
    editExpenseDate.value = btn.dataset.date;
    editExpenseDescription.value = btn.dataset.description;
}

document.querySelectorAll(".edit-expense-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        editExpenseErrors.innerHTML = "";
        fillEditExpenseModal(btn);
        editExpenseModal.show();
    });
});

editExpenseModalEl.addEventListener("shown.bs.modal", () => {
    editExpenseAmount.focus();
});

if (editExpenseModalEl.dataset.showModal === "true") {
    const errorBtn = document.querySelector(
        `.edit-expense-btn[data-expense-id="${editExpenseModalEl.dataset.editErrorId}"]`
    );
    if (errorBtn) {
        fillEditExpenseModal(errorBtn);
        editExpenseModal.show();
    }
}

const selectedCategories = new Set();
const expenseRows = document.querySelectorAll(".expense-row");
const noFilteredExpenses = document.getElementById("noFilteredExpenses");
const categoryCards = document.querySelectorAll(".category-card");
const clearCategorySelection = document.getElementById("clearCategorySelection");
const monthFilter = document.getElementById("monthFilter");
const dateFromFilter = document.getElementById("dateFromFilter");
const dateToFilter = document.getElementById("dateToFilter");
const minAmountFilter = document.getElementById("minAmountFilter");
const clearExpenseFilters = document.getElementById("clearExpenseFilters");
const dashboardTotal = document.getElementById("dashboardTotal");
const filterDescription = document.getElementById("filterDescription");
const clearAllFilters = document.getElementById("clearAllFilters");

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const months = new Set();
expenseRows.forEach((row) => months.add(row.dataset.date.slice(0, 7)));
Array.from(months).sort().reverse().forEach((month) => {
    const [year, monthNum] = month.split("-");
    const option = document.createElement("option");
    option.value = month;
    option.textContent = `${MONTH_NAMES[parseInt(monthNum, 10) - 1]} ${year}`;
    monthFilter.appendChild(option);
});

function formatDateDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${MONTH_NAMES[month - 1].slice(0, 3)} ${day}, ${year}`;
}

function buildFilterDescription(month, dateFrom, dateTo, minAmount) {
    const parts = [];

    if (selectedCategories.size > 0) {
        parts.push(Array.from(selectedCategories).join(", "));
    }

    if (month) {
        parts.push(monthFilter.options[monthFilter.selectedIndex].textContent);
    } else if (dateFrom || dateTo) {
        if (dateFrom && dateTo) {
            parts.push(`${formatDateDisplay(dateFrom)} – ${formatDateDisplay(dateTo)}`);
        } else if (dateFrom) {
            parts.push(`From ${formatDateDisplay(dateFrom)}`);
        } else {
            parts.push(`Through ${formatDateDisplay(dateTo)}`);
        }
    }

    if (!isNaN(minAmount)) {
        parts.push(`≥ $${minAmount.toFixed(2)}`);
    }

    return parts.length > 0 ? parts.join(" · ") : "All expenses";
}

function filterExpenses() {
    const month = monthFilter.value;
    const dateFrom = dateFromFilter.value;
    const dateTo = dateToFilter.value;
    const minAmount = parseFloat(minAmountFilter.value);

    let visibleCount = 0;
    let visibleTotal = 0;
    expenseRows.forEach((row) => {
        const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(row.dataset.category);

        let dateMatch = true;
        if (month) {
            dateMatch = row.dataset.date.startsWith(month);
        } else if (dateFrom || dateTo) {
            dateMatch = (!dateFrom || row.dataset.date >= dateFrom) && (!dateTo || row.dataset.date <= dateTo);
        }

        const amountMatch = isNaN(minAmount) || parseFloat(row.dataset.amount) >= minAmount;

        const show = categoryMatch && dateMatch && amountMatch;
        row.classList.toggle("d-none", !show);
        if (show) {
            visibleCount++;
            visibleTotal += parseFloat(row.dataset.amount);
        }
    });
    noFilteredExpenses.classList.toggle("d-none", visibleCount !== 0 || expenseRows.length === 0);

    dashboardTotal.textContent = "Total: $" + visibleTotal.toFixed(2);
    filterDescription.textContent = buildFilterDescription(month, dateFrom, dateTo, minAmount);

    const hasSelection = selectedCategories.size > 0;
    clearCategorySelection.disabled = !hasSelection;
    clearCategorySelection.classList.toggle("btn-secondary", hasSelection);
    clearCategorySelection.classList.toggle("btn-outline-secondary", !hasSelection);

    const hasExpenseFilters = Boolean(month || dateFrom || dateTo || minAmountFilter.value);
    clearExpenseFilters.disabled = !hasExpenseFilters;
    clearExpenseFilters.classList.toggle("btn-secondary", hasExpenseFilters);
    clearExpenseFilters.classList.toggle("btn-outline-secondary", !hasExpenseFilters);

    const hasAnyFilters = hasSelection || hasExpenseFilters;
    clearAllFilters.disabled = !hasAnyFilters;
    clearAllFilters.classList.toggle("btn-secondary", hasAnyFilters);
    clearAllFilters.classList.toggle("btn-outline-secondary", !hasAnyFilters);

    updateCharts();
}

categoryCards.forEach((card) => {
    card.addEventListener("click", (event) => {
        if (event.target.closest(".edit-emoji-btn, form")) return;

        const category = card.dataset.category;
        if (selectedCategories.has(category)) {
            selectedCategories.delete(category);
            card.classList.remove("category-selected");
        } else {
            selectedCategories.add(category);
            card.classList.add("category-selected");
        }
        filterExpenses();
    });
});

clearCategorySelection.addEventListener("click", () => {
    selectedCategories.clear();
    categoryCards.forEach((card) => card.classList.remove("category-selected"));
    filterExpenses();
});

monthFilter.addEventListener("change", () => {
    if (monthFilter.value) {
        dateFromFilter.value = "";
        dateToFilter.value = "";
    }
    filterExpenses();
});

[dateFromFilter, dateToFilter].forEach((input) => {
    input.addEventListener("input", () => {
        monthFilter.value = "";
        filterExpenses();
    });
});

minAmountFilter.addEventListener("input", filterExpenses);

clearExpenseFilters.addEventListener("click", () => {
    monthFilter.value = "";
    dateFromFilter.value = "";
    dateToFilter.value = "";
    minAmountFilter.value = "";
    filterExpenses();
});

clearAllFilters.addEventListener("click", () => {
    selectedCategories.clear();
    categoryCards.forEach((card) => card.classList.remove("category-selected"));
    monthFilter.value = "";
    dateFromFilter.value = "";
    dateToFilter.value = "";
    minAmountFilter.value = "";
    filterExpenses();
});

const CATEGORICAL_LIGHT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];
const CATEGORICAL_DARK = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];
const OTHER_LABEL = "Other";
const OTHER_COLOR_LIGHT = "#898781";
const OTHER_COLOR_DARK = "#a3a299";

const CHART_THEME = {
    light: { grid: "#e1e0d9", tick: "#898781", text: "#52514e" },
    dark: { grid: "#2c2c2a", tick: "#898781", text: "#c3c2b7" },
};

function isDarkMode() {
    return document.documentElement.getAttribute("data-bs-theme") === "dark";
}

// Color follows the category (entity), not its rank in the current filter,
// so slots are assigned once from stable, server-rendered card order.
const categoryColorSlots = new Map();
categoryCards.forEach((card, index) => {
    categoryColorSlots.set(card.dataset.category, index < CATEGORICAL_LIGHT.length ? index : -1);
});

function getCategoryColor(name) {
    const palette = isDarkMode() ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
    const slot = categoryColorSlots.has(name) ? categoryColorSlots.get(name) : -1;
    if (slot >= 0) return palette[slot];
    return isDarkMode() ? OTHER_COLOR_DARK : OTHER_COLOR_LIGHT;
}

function getSurfaceColor() {
    return getComputedStyle(document.body).backgroundColor;
}

function currencyTick(value) {
    return "$" + value;
}

const categoryBarChart = new Chart(document.getElementById("categoryBarChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], maxBarThickness: 24, borderRadius: 4 }] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Expenses by Category" },
            tooltip: { callbacks: { label: (ctx) => " $" + ctx.parsed.y.toFixed(2) } },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: currencyTick } },
        },
    },
});

const categoryPieChart = new Chart(document.getElementById("categoryPieChart"), {
    type: "doughnut",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 2 }] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "bottom" },
            title: { display: true, text: "Share by Category" },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const total = ctx.dataset.data.reduce((sum, value) => sum + value, 0);
                        const pct = total ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0";
                        return ` ${ctx.label}: $${ctx.parsed.toFixed(2)} (${pct}%)`;
                    },
                },
            },
        },
    },
});

const spendingOverTimeChart = new Chart(document.getElementById("spendingOverTimeChart"), {
    type: "line",
    data: {
        datasets: [{
            data: [],
            borderColor: CATEGORICAL_LIGHT[0],
            backgroundColor: "rgba(42, 120, 214, 0.1)",
            fill: true,
            tension: 0.0,
            borderWidth: 2,
            pointRadius: 3,
        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Spending Over Time" },
            tooltip: { callbacks: { label: (ctx) => " $" + ctx.parsed.y.toFixed(2) } },
        },
        scales: {
            x: { type: "time", time: { unit: "day", tooltipFormat: "MMM dd, yyyy", displayFormats: { day: "MMM d" } }, grid: { display: true } },
            y: { beginAtZero: true, ticks: { callback: currencyTick } },
        },
    },
});

function refreshChartsTheme() {
    const theme = CHART_THEME[isDarkMode() ? "dark" : "light"];
    const lineColor = isDarkMode() ? "#ffffff" : "#000000";

    [categoryBarChart, spendingOverTimeChart].forEach((chart) => {
        chart.options.scales.x.ticks = { ...chart.options.scales.x.ticks, color: theme.tick };
        chart.options.scales.y.ticks = { ...chart.options.scales.y.ticks, color: theme.tick };
        chart.options.scales.y.grid = { color: theme.grid };
        chart.options.plugins.title.color = theme.text;
    });
    categoryBarChart.options.plugins.title.text = "Expenses by Category";
    spendingOverTimeChart.data.datasets[0].borderColor = lineColor;
    spendingOverTimeChart.data.datasets[0].backgroundColor = lineColor.startsWith("#")
        ? lineColor + "1a"
        : lineColor;

    categoryPieChart.options.plugins.legend.labels = { color: theme.text };
    categoryPieChart.options.plugins.title.color = theme.text;
    categoryPieChart.data.datasets[0].borderColor = getSurfaceColor();

    updateCharts();
}

function updateCharts() {
    const categoryTotals = new Map();
    const dateTotals = new Map();

    expenseRows.forEach((row) => {
        if (row.classList.contains("d-none")) return;
        const category = row.dataset.category;
        const amount = parseFloat(row.dataset.amount);
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + amount);
        dateTotals.set(row.dataset.date, (dateTotals.get(row.dataset.date) || 0) + amount);
    });

    const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);

    categoryBarChart.data.labels = sortedCategories.map(([name]) => name);
    categoryBarChart.data.datasets[0].data = sortedCategories.map(([, total]) => total);
    categoryBarChart.data.datasets[0].backgroundColor = sortedCategories.map(([name]) => getCategoryColor(name));
    categoryBarChart.update();

    let pieEntries = sortedCategories.map(([name, total]) => ({ name, total }));
    if (pieEntries.length > 6) {
        const top = pieEntries.slice(0, 5);
        const otherTotal = pieEntries.slice(5).reduce((sum, entry) => sum + entry.total, 0);
        pieEntries = [...top, { name: OTHER_LABEL, total: otherTotal }];
    }
    categoryPieChart.data.labels = pieEntries.map((entry) => entry.name);
    categoryPieChart.data.datasets[0].data = pieEntries.map((entry) => entry.total);
    categoryPieChart.data.datasets[0].backgroundColor = pieEntries.map((entry) => getCategoryColor(entry.name));
    categoryPieChart.data.datasets[0].borderColor = getSurfaceColor();
    categoryPieChart.update();

    const sortedDates = Array.from(dateTotals.keys()).sort();
    spendingOverTimeChart.data.datasets[0].data = sortedDates.map((date) => ({
        x: new Date(date + "T00:00:00"),
        y: dateTotals.get(date),
    }));
    spendingOverTimeChart.update();
}

function interceptForm(form, errorContainer) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        errorContainer.innerHTML = "";

        let response;
        try {
            response = await fetch(form.action, {
                method: "POST",
                headers: { "X-Requested-With": "XMLHttpRequest" },
                body: new FormData(form),
            });
        } catch (err) {
            errorContainer.innerHTML = '<div class="alert alert-danger">Network error — please try again.</div>';
            return;
        }

        if (response.ok) {
            window.location.href = response.url;
            return;
        }

        const data = await response.json().catch(() => ({}));
        errorContainer.innerHTML = `<div class="alert alert-danger">${data.error || "Something went wrong."}</div>`;
    });
}

interceptForm(document.getElementById("addExpenseForm"), document.getElementById("addExpenseErrors"));
interceptForm(editExpenseForm, editExpenseErrors);
interceptForm(document.getElementById("addCategoryForm"), document.getElementById("addCategoryErrors"));

filterExpenses();
