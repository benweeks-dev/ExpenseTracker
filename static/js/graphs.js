const expenseData = JSON.parse(document.getElementById("expenseData").textContent);

const categoryChips = document.querySelectorAll(".category-chip");
const selectedCategories = new Set();
const monthFilter = document.getElementById("graphMonthFilter");
const dateFromFilter = document.getElementById("graphDateFromFilter");
const dateToFilter = document.getElementById("graphDateToFilter");
const minAmountFilter = document.getElementById("graphMinAmountFilter");
const clearAllBtn = document.getElementById("graphClearAll");
const topCategoriesBody = document.getElementById("topCategoriesBody");
const noTopCategories = document.getElementById("noTopCategories");

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const months = new Set();
expenseData.forEach((e) => months.add(e.date.slice(0, 7)));
Array.from(months).sort().reverse().forEach((month) => {
    const [year, monthNum] = month.split("-");
    const option = document.createElement("option");
    option.value = month;
    option.textContent = `${MONTH_NAMES[parseInt(monthNum, 10) - 1]} ${year}`;
    monthFilter.appendChild(option);
});

function formatMonthLabel(monthKey) {
    const [year, monthNum] = monthKey.split("-");
    return `${MONTH_NAMES[parseInt(monthNum, 10) - 1].slice(0, 3)} ${year}`;
}

function getFilteredExpenses() {
    const month = monthFilter.value;
    const dateFrom = dateFromFilter.value;
    const dateTo = dateToFilter.value;
    const minAmount = parseFloat(minAmountFilter.value);

    return expenseData.filter((e) => {
        const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(e.category);

        let dateMatch = true;
        if (month) {
            dateMatch = e.date.startsWith(month);
        } else if (dateFrom || dateTo) {
            dateMatch = (!dateFrom || e.date >= dateFrom) && (!dateTo || e.date <= dateTo);
        }

        const amountMatch = isNaN(minAmount) || e.amount >= minAmount;

        return categoryMatch && dateMatch && amountMatch;
    });
}

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

function getSurfaceColor() {
    return getComputedStyle(document.body).backgroundColor;
}

// Color follows the category (entity), not its rank in the current filter,
// so slots are assigned once from stable, server-rendered chip order.
const categoryColorSlots = new Map();
categoryChips.forEach((chip, index) => {
    categoryColorSlots.set(chip.dataset.category, index < CATEGORICAL_LIGHT.length ? index : -1);
});

function getCategoryColor(name) {
    const palette = isDarkMode() ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
    const slot = categoryColorSlots.has(name) ? categoryColorSlots.get(name) : -1;
    if (slot >= 0) return palette[slot];
    return isDarkMode() ? OTHER_COLOR_DARK : OTHER_COLOR_LIGHT;
}

function currencyTick(value) {
    return "$" + value;
}

const graphCategoryBarChart = new Chart(document.getElementById("graphCategoryBarChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], maxBarThickness: 32, borderRadius: 4 }] },
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

const graphCategoryPieChart = new Chart(document.getElementById("graphCategoryPieChart"), {
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

const graphSpendingOverTimeChart = new Chart(document.getElementById("graphSpendingOverTimeChart"), {
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

const categoryTrendsChart = new Chart(document.getElementById("categoryTrendsChart"), {
    type: "line",
    data: { labels: [], datasets: [] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: "bottom" },
            title: { display: true, text: "Category Trends" },
            tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toFixed(2)}` } },
        },
        scales: {
            x: { grid: { display: true } },
            y: { beginAtZero: true, ticks: { callback: currencyTick } },
        },
    },
});

const monthOverMonthChart = new Chart(document.getElementById("monthOverMonthChart"), {
    type: "bar",
    data: { labels: [], datasets: [{ data: [], backgroundColor: [], maxBarThickness: 40, borderRadius: 4 }] },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Month-over-Month" },
            tooltip: { callbacks: { label: (ctx) => " $" + ctx.parsed.y.toFixed(2) } },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: currencyTick } },
        },
    },
});

function render() {
    const filtered = getFilteredExpenses();

    const categoryTotals = new Map();
    const dateTotals = new Map();
    const monthTotals = new Map();
    const categoryMonthTotals = new Map();

    filtered.forEach((e) => {
        categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + e.amount);
        dateTotals.set(e.date, (dateTotals.get(e.date) || 0) + e.amount);

        const month = e.date.slice(0, 7);
        monthTotals.set(month, (monthTotals.get(month) || 0) + e.amount);

        if (!categoryMonthTotals.has(e.category)) categoryMonthTotals.set(e.category, new Map());
        const catMonths = categoryMonthTotals.get(e.category);
        catMonths.set(month, (catMonths.get(month) || 0) + e.amount);
    });

    const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);
    const sortedCategories = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
    const sortedMonths = Array.from(monthTotals.keys()).sort();
    const monthLabels = sortedMonths.map(formatMonthLabel);

    graphCategoryBarChart.data.labels = sortedCategories.map(([name]) => name);
    graphCategoryBarChart.data.datasets[0].data = sortedCategories.map(([, total]) => total);
    graphCategoryBarChart.data.datasets[0].backgroundColor = sortedCategories.map(([name]) => getCategoryColor(name));
    graphCategoryBarChart.update();

    let pieEntries = sortedCategories.map(([name, total]) => ({ name, total }));
    if (pieEntries.length > 6) {
        const top = pieEntries.slice(0, 5);
        const otherTotal = pieEntries.slice(5).reduce((sum, entry) => sum + entry.total, 0);
        pieEntries = [...top, { name: OTHER_LABEL, total: otherTotal }];
    }
    graphCategoryPieChart.data.labels = pieEntries.map((entry) => entry.name);
    graphCategoryPieChart.data.datasets[0].data = pieEntries.map((entry) => entry.total);
    graphCategoryPieChart.data.datasets[0].backgroundColor = pieEntries.map((entry) => getCategoryColor(entry.name));
    graphCategoryPieChart.data.datasets[0].borderColor = getSurfaceColor();
    graphCategoryPieChart.update();

    const sortedDates = Array.from(dateTotals.keys()).sort();
    graphSpendingOverTimeChart.data.datasets[0].data = sortedDates.map((date) => ({
        x: new Date(date + "T00:00:00"),
        y: dateTotals.get(date),
    }));
    graphSpendingOverTimeChart.update();

    monthOverMonthChart.data.labels = monthLabels;
    monthOverMonthChart.data.datasets[0].data = sortedMonths.map((m) => monthTotals.get(m));
    monthOverMonthChart.update();

    categoryTrendsChart.data.labels = monthLabels;
    categoryTrendsChart.data.datasets = sortedCategories.map(([name]) => {
        const catMonths = categoryMonthTotals.get(name) || new Map();
        const color = getCategoryColor(name);
        return {
            label: name,
            data: sortedMonths.map((m) => catMonths.get(m) || 0),
            borderColor: color,
            backgroundColor: color,
            tension: 0.0,
            borderWidth: 2,
            pointRadius: 3,
        };
    });
    categoryTrendsChart.update();

    topCategoriesBody.innerHTML = "";
    sortedCategories.forEach(([name, total], index) => {
        const pct = filteredTotal ? ((total / filteredTotal) * 100).toFixed(1) : "0.0";
        const row = document.createElement("tr");
        [index + 1, name, "$" + total.toFixed(2), pct + "%"].forEach((text, i) => {
            const td = document.createElement("td");
            td.textContent = text;
            if (i >= 2) td.classList.add("text-end");
            row.appendChild(td);
        });
        topCategoriesBody.appendChild(row);
    });
    noTopCategories.classList.toggle("d-none", sortedCategories.length !== 0);

    const hasFilters = selectedCategories.size > 0 || Boolean(monthFilter.value || dateFromFilter.value || dateToFilter.value || minAmountFilter.value);
    clearAllBtn.disabled = !hasFilters;
    clearAllBtn.classList.toggle("btn-secondary", hasFilters);
    clearAllBtn.classList.toggle("btn-outline-secondary", !hasFilters);
}

function refreshChartsTheme() {
    const theme = CHART_THEME[isDarkMode() ? "dark" : "light"];
    const lineColor = isDarkMode() ? "#ffffff" : "#000000";
    const accentColor = isDarkMode() ? "#d2d2d2" : "#313131";

    [graphCategoryBarChart, graphSpendingOverTimeChart, categoryTrendsChart, monthOverMonthChart].forEach((chart) => {
        chart.options.scales.x.ticks = { ...chart.options.scales.x.ticks, color: theme.tick };
        chart.options.scales.y.ticks = { ...chart.options.scales.y.ticks, color: theme.tick };
        chart.options.scales.y.grid = { color: theme.grid };
        chart.options.plugins.title.color = theme.text;
    });

    graphSpendingOverTimeChart.data.datasets[0].borderColor = lineColor;
    graphSpendingOverTimeChart.data.datasets[0].backgroundColor = lineColor.startsWith("#")
        ? lineColor + "1a"
        : lineColor;

    monthOverMonthChart.data.datasets[0].backgroundColor = accentColor;

    graphCategoryPieChart.options.plugins.legend.labels = { color: theme.text };
    graphCategoryPieChart.options.plugins.title.color = theme.text;
    graphCategoryPieChart.data.datasets[0].borderColor = getSurfaceColor();

    categoryTrendsChart.options.plugins.legend.labels = { color: theme.text };

    render();
}

categoryChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        const category = chip.dataset.category;
        if (selectedCategories.has(category)) {
            selectedCategories.delete(category);
            chip.classList.remove("btn-secondary");
            chip.classList.add("btn-outline-secondary");
        } else {
            selectedCategories.add(category);
            chip.classList.remove("btn-outline-secondary");
            chip.classList.add("btn-secondary");
        }
        render();
    });
});

monthFilter.addEventListener("change", () => {
    if (monthFilter.value) {
        dateFromFilter.value = "";
        dateToFilter.value = "";
    }
    render();
});

[dateFromFilter, dateToFilter].forEach((input) => {
    input.addEventListener("input", () => {
        monthFilter.value = "";
        render();
    });
});

minAmountFilter.addEventListener("input", render);

clearAllBtn.addEventListener("click", () => {
    selectedCategories.clear();
    categoryChips.forEach((chip) => {
        chip.classList.remove("btn-secondary");
        chip.classList.add("btn-outline-secondary");
    });
    monthFilter.value = "";
    dateFromFilter.value = "";
    dateToFilter.value = "";
    minAmountFilter.value = "";
    render();
});

render();
