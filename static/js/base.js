const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeToggle.textContent = theme === "dark" ? "☀️ Theme" : "🌙 Theme";
    document.querySelectorAll("emoji-picker").forEach((picker) => {
        picker.classList.remove("light", "dark");
        picker.classList.add(theme);
    });
    if (typeof refreshChartsTheme === "function") {
        refreshChartsTheme();
    }
}

themeToggle.addEventListener("click", () => {
    const newTheme = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
});

function wireEmojiPicker(previewBtn, hiddenInput, picker) {
    previewBtn.addEventListener("click", () => {
        picker.classList.toggle("d-none");
    });
    picker.addEventListener("emoji-click", (event) => {
        const emoji = event.detail.unicode;
        hiddenInput.value = emoji;
        previewBtn.textContent = emoji;
        picker.classList.add("d-none");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    applyTheme(localStorage.getItem("theme") || "light");
});
