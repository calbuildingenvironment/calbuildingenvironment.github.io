/*==================================================
CALIFORNIA BUILDING ENVIRONMENT
MAIN JAVASCRIPT
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

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
      SMOOTH SCROLL
    =========================*/

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", function (e) {

            const target = document.querySelector(this.getAttribute("href"));

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth",
                block: "start"

            });

        });

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

});