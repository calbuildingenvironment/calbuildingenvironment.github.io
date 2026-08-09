/*==================================================
CALIFORNIA BUILDING ENVIRONMENT
MAIN JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*=========================
      CURRENT YEAR
    =========================*/

    const yearEl = document.querySelector(".current-year");

    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /*=========================
      ACTIVE NAV STATE
    =========================*/

    const herePath = location.pathname.replace(/\/index\.html$/, "") || "/";

    document.querySelectorAll(".main-nav a[href]").forEach((link) => {

        const targetPath = (new URL(link.href)).pathname.replace(/\/index\.html$/, "") || "/";

        if (targetPath === herePath || (herePath.startsWith(targetPath) && targetPath !== "/")) {
            link.classList.add("active");
        }

    });

    /*=========================
      MOBILE MENU
    =========================*/

    const navToggle = document.querySelector(".nav-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (navToggle && mainNav) {

        const closeMenu = () => {
            mainNav.classList.remove("show-menu");
            navToggle.setAttribute("aria-expanded", "false");
        };

        navToggle.addEventListener("click", () => {

            mainNav.classList.toggle("show-menu");

            navToggle.setAttribute(
                "aria-expanded",
                mainNav.classList.contains("show-menu") ? "true" : "false"
            );

        });

        document.addEventListener("click", (event) => {
            if (
                mainNav.classList.contains("show-menu") &&
                !mainNav.contains(event.target) &&
                !navToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

    }

    /*=========================
      STICKY HEADER
    =========================*/

    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 80) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

    /*=========================
      SCROLL ANIMATIONS
    =========================*/

    const animatedItems = document.querySelectorAll(
        ".service-card, .industry-card, .process-card, .county-card, .resource-card, .trust-item"
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                }

            });

        }, {

            threshold: 0.15

        });

        animatedItems.forEach(item => {

            item.classList.add("fade-up");

            observer.observe(item);

        });

    }

    /*=========================
      BACK TO TOP BUTTON
    =========================*/

    const topBtn = document.querySelector("#topBtn");

    if (topBtn) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 400) {
                topBtn.classList.add("show");
            } else {
                topBtn.classList.remove("show");
            }

        });

        topBtn.addEventListener("click", () => {

            window.scrollTo({ top: 0, behavior: "smooth" });

        });

    }

});