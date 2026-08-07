const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);
    themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
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

const sidebarEl = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const desktopQuery = window.matchMedia("(min-width: 992px)");

sidebarToggle.addEventListener("click", () => {
    if (desktopQuery.matches) {
        const collapsed = !document.documentElement.classList.contains("sidebar-collapsed");
        document.documentElement.classList.toggle("sidebar-collapsed", collapsed);
        localStorage.setItem("sidebarCollapsed", collapsed);
    } else {
        bootstrap.Offcanvas.getOrCreateInstance(sidebarEl).toggle();
    }
});
