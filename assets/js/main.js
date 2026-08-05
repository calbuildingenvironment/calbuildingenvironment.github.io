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
      MOBILE MENU
    =========================*/

    const menuButton = document.querySelector(".mobile-menu");
    const navMenu = document.querySelector("nav ul");

    if (menuButton && navMenu) {

        menuButton.addEventListener("click", () => {

            navMenu.classList.toggle("show-menu");

            menuButton.innerHTML =
                navMenu.classList.contains("show-menu") ? "✕" : "☰";

        });

    }

    /*=========================
      MOBILE MENU (industries pages template)
    =========================*/

    const navToggle = document.querySelector(".nav-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (navToggle && mainNav) {

        navToggle.addEventListener("click", () => {

            mainNav.classList.toggle("show-menu");

            navToggle.setAttribute(
                "aria-expanded",
                mainNav.classList.contains("show-menu") ? "true" : "false"
            );

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

    /*=========================
      QUOTE FORM
    =========================*/

    const quoteForm = document.querySelector(".quote-form");

    if (quoteForm) {

        quoteForm.addEventListener("submit", (e) => {

            e.preventDefault();

            const field = (key) => quoteForm.elements.namedItem(key).value.trim();
            const subject = encodeURIComponent(
                `Quote Request: ${field("service")} - ${field("name")}`
            );
            const body = encodeURIComponent(
                `Name: ${field("name")}\n` +
                `Email: ${field("email")}\n` +
                `Phone: ${field("phone")}\n` +
                `Service: ${field("service")}\n\n` +
                `${field("message")}`
            );

            window.location.href =
                `mailto:calbuildingenvironment@gmail.com?subject=${subject}&body=${body}`;

        });

    }

});