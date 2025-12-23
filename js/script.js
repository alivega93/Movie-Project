document.addEventListener("DOMContentLoaded", () => {
  const navItems = document.querySelectorAll(".nav > li");
  navItems.forEach((item) => item.classList.remove("open"));

  navItems.forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    const submenu = item.querySelector(
      ":scope > .submenu, :scope > .submenu-grid, :scope > .cuenta-menu"
    );

    if (submenu && trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        navItems.forEach((i) => {
          if (i !== item) i.classList.remove("open");
        });
        item.classList.toggle("open");
      });
      item.addEventListener("mouseleave", () => item.classList.remove("open"));
    } else if (trigger) {
      trigger.addEventListener("click", () => {
        navItems.forEach((i) => i.classList.remove("open"));
      });
    }
  });

  document.addEventListener("click", (e) => {
    const header = document.querySelector(".site-header");
    if (!header.contains(e.target)) {
      navItems.forEach((i) => i.classList.remove("open"));
    }
  });

  let isAuthenticated = false;

  function updateCuentaMenu() {
    document.querySelectorAll(".cuenta-menu .guest-only").forEach((el) => {
      el.style.display = isAuthenticated ? "none" : "block";
    });

    document.querySelectorAll(".cuenta-menu .auth-only").forEach((el) => {
      el.style.display = isAuthenticated ? "block" : "none";
    });
  }

  updateCuentaMenu();

  document
    .querySelector(".cuenta-menu .guest-only a")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      isAuthenticated = true;
      updateCuentaMenu();
    });

  document
    .querySelector(".cuenta-menu .auth-only a")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      isAuthenticated = false;
      updateCuentaMenu();
    });
});
