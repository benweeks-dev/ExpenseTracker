function wireCategorySelect(select, modal, errorsEl) {
    let lastValidCategory = select.value;
    select.addEventListener("change", () => {
        if (select.value === "__new__") {
            select.value = lastValidCategory;
            errorsEl.innerHTML = "";
            modal.show();
        } else {
            lastValidCategory = select.value;
        }
    });
}

const addIncomeCategoryModalEl = document.getElementById("addIncomeCategoryModal");
const addIncomeCategoryModal = new bootstrap.Modal(addIncomeCategoryModalEl);
const addIncomeCategoryErrors = document.getElementById("addIncomeCategoryErrors");

wireCategorySelect(document.getElementById("income-category-select"), addIncomeCategoryModal, addIncomeCategoryErrors);

addIncomeCategoryModalEl.addEventListener("shown.bs.modal", () => {
    addIncomeCategoryModalEl.querySelector('input[name="name"]').focus();
});

if (addIncomeCategoryModalEl.dataset.showModal === "true") {
    addIncomeCategoryModal.show();
}

const editIncomeEmojiModalEl = document.getElementById("editIncomeEmojiModal");
const editIncomeEmojiModal = new bootstrap.Modal(editIncomeEmojiModalEl);
const editIncomeEmojiForm = document.getElementById("editIncomeEmojiForm");
const editIncomeEmojiInput = document.getElementById("editIncomeEmojiInput");
const editIncomeEmojiPreview = document.getElementById("editIncomeEmojiPreview");
const editIncomeEmojiPicker = document.getElementById("editIncomeEmojiPicker");

document.querySelectorAll(".edit-emoji-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        editIncomeEmojiForm.action = btn.dataset.editUrl;
        editIncomeEmojiInput.value = btn.dataset.currentEmoji;
        editIncomeEmojiPreview.textContent = btn.dataset.currentEmoji || "🏷️";
        editIncomeEmojiPicker.classList.add("d-none");
        editIncomeEmojiModal.show();
    });
});

editIncomeEmojiModalEl.addEventListener("shown.bs.modal", () => {
    editIncomeEmojiPreview.focus();
});

wireEmojiPicker(
    document.getElementById("addIncomeEmojiPreview"),
    document.getElementById("addIncomeEmojiInput"),
    document.getElementById("addIncomeEmojiPicker")
);

wireEmojiPicker(editIncomeEmojiPreview, editIncomeEmojiInput, editIncomeEmojiPicker);

const editIncomeModalEl = document.getElementById("editIncomeModal");
const editIncomeModal = new bootstrap.Modal(editIncomeModalEl);
const editIncomeForm = document.getElementById("editIncomeForm");
const editIncomeErrors = document.getElementById("editIncomeErrors");
const editIncomeAmount = document.getElementById("editIncomeAmount");
const editIncomeCategory = document.getElementById("editIncomeCategory");
const editIncomeDate = document.getElementById("editIncomeDate");
const editIncomeDescription = document.getElementById("editIncomeDescription");

function fillEditIncomeModal(btn) {
    editIncomeForm.action = btn.dataset.editUrl;
    editIncomeAmount.value = btn.dataset.amount;
    editIncomeCategory.value = btn.dataset.category;
    editIncomeDate.value = btn.dataset.date;
    editIncomeDescription.value = btn.dataset.description;
}

document.querySelectorAll(".edit-income-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        editIncomeErrors.innerHTML = "";
        fillEditIncomeModal(btn);
        editIncomeModal.show();
    });
});

editIncomeModalEl.addEventListener("shown.bs.modal", () => {
    editIncomeAmount.focus();
});

if (editIncomeModalEl.dataset.showModal === "true") {
    const errorBtn = document.querySelector(
        `.edit-income-btn[data-income-id="${editIncomeModalEl.dataset.editErrorId}"]`
    );
    if (errorBtn) {
        fillEditIncomeModal(errorBtn);
        editIncomeModal.show();
    }
}

const recurringModalEl = document.getElementById("recurringIncomeModal");
const recurringModal = new bootstrap.Modal(recurringModalEl);
const recurringForm = document.getElementById("recurringIncomeForm");
const recurringErrors = document.getElementById("recurringIncomeErrors");
const recurringModalLabel = document.getElementById("recurringIncomeModalLabel");
const recurringSubmitBtn = document.getElementById("recurringSubmitBtn");
const recurringAmount = document.getElementById("recurringAmount");
const recurringFrequency = document.getElementById("recurringFrequency");
const recurringCategory = document.getElementById("recurringCategorySelect");
const recurringStartDate = document.getElementById("recurringStartDate");
const recurringEndDate = document.getElementById("recurringEndDate");
const recurringDescription = document.getElementById("recurringDescription");
const recurringActive = document.getElementById("recurringActive");
const addRecurringUrl = recurringForm.action;

function resetRecurringModal() {
    recurringForm.action = addRecurringUrl;
    recurringModalLabel.textContent = "Add Recurring Income";
    recurringSubmitBtn.textContent = "Add Recurring Income";
    recurringAmount.value = "";
    recurringFrequency.value = "monthly";
    recurringCategory.value = "";
    recurringStartDate.value = "";
    recurringEndDate.value = "";
    recurringDescription.value = "";
    recurringActive.checked = true;
}

function fillEditRecurringModal(btn) {
    recurringForm.action = btn.dataset.editUrl;
    recurringModalLabel.textContent = "Edit Recurring Income";
    recurringSubmitBtn.textContent = "Save";
    recurringAmount.value = btn.dataset.amount;
    recurringFrequency.value = btn.dataset.frequency;
    recurringCategory.value = btn.dataset.category;
    recurringStartDate.value = btn.dataset.startDate;
    recurringEndDate.value = btn.dataset.endDate;
    recurringDescription.value = btn.dataset.description;
    recurringActive.checked = btn.dataset.active === "true";
}

document.getElementById("addRecurringBtn").addEventListener("click", () => {
    recurringErrors.innerHTML = "";
    resetRecurringModal();
    recurringModal.show();
});

document.querySelectorAll(".edit-recurring-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        recurringErrors.innerHTML = "";
        fillEditRecurringModal(btn);
        recurringModal.show();
    });
});

recurringModalEl.addEventListener("shown.bs.modal", () => {
    recurringAmount.focus();
});

if (recurringModalEl.dataset.showModal === "true") {
    const editRuleId = recurringModalEl.dataset.editErrorId;
    const errorBtn = editRuleId
        ? document.querySelector(`.edit-recurring-btn[data-rule-id="${editRuleId}"]`)
        : null;
    if (errorBtn) {
        fillEditRecurringModal(errorBtn);
    } else {
        resetRecurringModal();
    }
    recurringModal.show();
}

interceptForm(document.getElementById("addIncomeForm"), document.getElementById("addIncomeErrors"));
interceptForm(editIncomeForm, editIncomeErrors);
interceptForm(document.getElementById("addIncomeCategoryForm"), addIncomeCategoryErrors);
interceptForm(recurringForm, recurringErrors);

const selectedCategories = new Set();
const incomeRows = document.querySelectorAll(".income-row");
const noFilteredIncome = document.getElementById("noFilteredIncome");
const categoryCards = document.querySelectorAll(".category-card");
const clearIncomeCategorySelection = document.getElementById("clearIncomeCategorySelection");
const incomeMonthFilter = document.getElementById("incomeMonthFilter");
const incomeDateFromFilter = document.getElementById("incomeDateFromFilter");
const incomeDateToFilter = document.getElementById("incomeDateToFilter");
const incomeMinAmountFilter = document.getElementById("incomeMinAmountFilter");
const clearIncomeFilters = document.getElementById("clearIncomeFilters");
const incomeTotal = document.getElementById("incomeTotal");
const incomeFilterDescription = document.getElementById("incomeFilterDescription");
const clearAllIncomeFilters = document.getElementById("clearAllIncomeFilters");

const INCOME_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const incomeMonths = new Set();
incomeRows.forEach((row) => incomeMonths.add(row.dataset.date.slice(0, 7)));
Array.from(incomeMonths).sort().reverse().forEach((month) => {
    const [year, monthNum] = month.split("-");
    const option = document.createElement("option");
    option.value = month;
    option.textContent = `${INCOME_MONTH_NAMES[parseInt(monthNum, 10) - 1]} ${year}`;
    incomeMonthFilter.appendChild(option);
});

function formatIncomeDateDisplay(dateStr) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${INCOME_MONTH_NAMES[month - 1].slice(0, 3)} ${day}, ${year}`;
}

function buildIncomeFilterDescription(month, dateFrom, dateTo, minAmount) {
    const parts = [];

    if (selectedCategories.size > 0) {
        parts.push(Array.from(selectedCategories).join(", "));
    }

    if (month) {
        parts.push(incomeMonthFilter.options[incomeMonthFilter.selectedIndex].textContent);
    } else if (dateFrom || dateTo) {
        if (dateFrom && dateTo) {
            parts.push(`${formatIncomeDateDisplay(dateFrom)} – ${formatIncomeDateDisplay(dateTo)}`);
        } else if (dateFrom) {
            parts.push(`From ${formatIncomeDateDisplay(dateFrom)}`);
        } else {
            parts.push(`Through ${formatIncomeDateDisplay(dateTo)}`);
        }
    }

    if (!isNaN(minAmount)) {
        parts.push(`≥ $${minAmount.toFixed(2)}`);
    }

    return parts.length > 0 ? parts.join(" · ") : "All income";
}

function filterIncome() {
    const month = incomeMonthFilter.value;
    const dateFrom = incomeDateFromFilter.value;
    const dateTo = incomeDateToFilter.value;
    const minAmount = parseFloat(incomeMinAmountFilter.value);

    let visibleCount = 0;
    let visibleTotal = 0;
    incomeRows.forEach((row) => {
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
    noFilteredIncome.classList.toggle("d-none", visibleCount !== 0 || incomeRows.length === 0);

    incomeTotal.textContent = "Total Income: $" + visibleTotal.toFixed(2);
    incomeFilterDescription.textContent = buildIncomeFilterDescription(month, dateFrom, dateTo, minAmount);

    const hasSelection = selectedCategories.size > 0;
    clearIncomeCategorySelection.disabled = !hasSelection;
    clearIncomeCategorySelection.classList.toggle("btn-secondary", hasSelection);
    clearIncomeCategorySelection.classList.toggle("btn-outline-secondary", !hasSelection);

    const hasIncomeFilters = Boolean(month || dateFrom || dateTo || incomeMinAmountFilter.value);
    clearIncomeFilters.disabled = !hasIncomeFilters;
    clearIncomeFilters.classList.toggle("btn-secondary", hasIncomeFilters);
    clearIncomeFilters.classList.toggle("btn-outline-secondary", !hasIncomeFilters);

    const hasAnyFilters = hasSelection || hasIncomeFilters;
    clearAllIncomeFilters.disabled = !hasAnyFilters;
    clearAllIncomeFilters.classList.toggle("btn-secondary", hasAnyFilters);
    clearAllIncomeFilters.classList.toggle("btn-outline-secondary", !hasAnyFilters);
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
        filterIncome();
    });
});

clearIncomeCategorySelection.addEventListener("click", () => {
    selectedCategories.clear();
    categoryCards.forEach((card) => card.classList.remove("category-selected"));
    filterIncome();
});

incomeMonthFilter.addEventListener("change", () => {
    if (incomeMonthFilter.value) {
        incomeDateFromFilter.value = "";
        incomeDateToFilter.value = "";
    }
    filterIncome();
});

[incomeDateFromFilter, incomeDateToFilter].forEach((input) => {
    input.addEventListener("input", () => {
        incomeMonthFilter.value = "";
        filterIncome();
    });
});

incomeMinAmountFilter.addEventListener("input", filterIncome);

clearIncomeFilters.addEventListener("click", () => {
    incomeMonthFilter.value = "";
    incomeDateFromFilter.value = "";
    incomeDateToFilter.value = "";
    incomeMinAmountFilter.value = "";
    filterIncome();
});

clearAllIncomeFilters.addEventListener("click", () => {
    selectedCategories.clear();
    categoryCards.forEach((card) => card.classList.remove("category-selected"));
    incomeMonthFilter.value = "";
    incomeDateFromFilter.value = "";
    incomeDateToFilter.value = "";
    incomeMinAmountFilter.value = "";
    filterIncome();
});

filterIncome();
