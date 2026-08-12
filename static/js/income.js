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
