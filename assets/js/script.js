import promotions from "./promotions.js";

// Modal toggle funkcija
let isAnimating = false;
function togglePopup() {
  const modal = document.getElementById("modal");
  if (!modal) return console.error("Modal nije pronađen!");
  if (isAnimating) return;
  isAnimating = true;
  if (!modal.classList.contains("active")) {
    modal.classList.add("active");
    modal.addEventListener("animationend", function handleAnimationEnd() {
      modal.removeEventListener("animationend", handleAnimationEnd);
      isAnimating = false;
    });
  } else {
    modal.classList.add("moveOut");
    modal.addEventListener("animationend", function handleAnimationEnd() {
      modal.removeEventListener("animationend", handleAnimationEnd);
      modal.classList.remove("active", "moveOut");
      isAnimating = false;
    });
  }
}
window.togglePopup = togglePopup;

// Datumi promocije
const promotionStartDate = new Date(2025, 3, 1);
const promotionEndDate = new Date(2025, 3, 30);
const originalCount =
  promotionEndDate.getDate() - promotionStartDate.getDate() + 1;

// Generiši slider iz promocija
function generateCalendarSlider() {
  const sliderTrack = document.querySelector(".slider-track");
  sliderTrack.innerHTML = "";
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  let currentDate = new Date(promotionStartDate);
  while (currentDate <= promotionEndDate) {
    const dayNumber = currentDate.getDate();
    const promoIndex =
      (dayNumber - promotionStartDate.getDate()) % promotions.length;
    const promo = promotions[promoIndex];

    const slide = document.createElement("div");
    slide.classList.add("slide");
    slide.dataset.day = dayNumber;
    slide.dataset.title = promo.title;

    const slideBg = document.createElement("div");
    slideBg.classList.add("slide-bg");
    slideBg.style.backgroundImage = `url(${promo.imageBox})`;
    slide.appendChild(slideBg);

    if (currentDate.getTime() > todayMidnight.getTime()) {
      slide.classList.add("no-click");
    }
    sliderTrack.appendChild(slide);
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Kloniraj slideove samo za desktop (slidesToShow > 1)
function cloneSlides(slidesToShow) {
  if (slidesToShow === 1) return;
  const sliderTrack = document.querySelector(".slider-track");
  const slides = sliderTrack.querySelectorAll(".slide");
  const slidesArray = Array.from(slides);
  slidesArray.slice(-slidesToShow).forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("clone");
    sliderTrack.insertBefore(clone, sliderTrack.firstChild);
  });
  slidesArray.slice(0, slidesToShow).forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("clone");
    sliderTrack.appendChild(clone);
  });
}

// Click handler za modal popup
document.querySelector(".slider-track").addEventListener("click", function (e) {
  const slide = e.target.closest(".slide");
  if (!slide) return;
  if (window.innerWidth >= 769) {
    if (!slide.classList.contains("center")) return;
  } else {
    // Na mobil/tabla, dozvoli klik ako slide NIJE zaključan
    if (slide.classList.contains("no-click")) return;
  }
  const dayNumber = parseInt(slide.dataset.day, 10);
  const promoIndex =
    (dayNumber - promotionStartDate.getDate()) % promotions.length;
  const promo = promotions[promoIndex];
  const popupContent = `
        <div class="header-flex">
          <h2><i>${promo.title}</i></h2>
        </div>
        <ul class="list-top">
          <h3>${promo.subtitle}</h3>
          ${promo.description
            .map((item, index) => {
              if (index === promo.description.length - 1) {
                return `
                <div class="list-rules">
                  <i class="fa-solid fa-check"></i>
                  <li>${item}</li>
                </div>
                ${
                  promo.description1
                    ? `
                  <ul class="sub-list">
                    ${promo.description1
                      .map((subItem) => `<li>${subItem}</li>`)
                      .join("")}
                  </ul>
                `
                    : ""
                }
              `;
              }
              return `
              <div class="list-rules">
                <i class="fa-solid fa-check"></i>
                <li>${item}</li>
              </div>
            `;
            })
            .join("")}
        </ul>
        <a href="${promo.link}" class="promo-link">${promo.button}</a>
      `;
  $("#modal .wrapper .content .box").html(popupContent);
  $(".header-flex").css({
    background: `url(${promo.image})`,
    "background-size": "cover",
    "background-position": "center",
  });
  togglePopup();
});

document.addEventListener("DOMContentLoaded", function () {
  generateCalendarSlider();
  function getSlidesToShow() {
    return window.innerWidth <= 768 ? 1 : 3;
  }
  const slidesToShow = getSlidesToShow();
  cloneSlides(slidesToShow);

  const track = document.querySelector(".slider-track");
  let slides = document.querySelectorAll(".slide");

  // Inicijalizacija currentIndex:
  let currentIndex = slidesToShow === 1 ? 0 : slidesToShow;
  const today = new Date();
  if (today >= promotionStartDate && today <= promotionEndDate) {
    let dayOffset = today.getDate() - promotionStartDate.getDate();
    currentIndex =
      slidesToShow === 1 ? dayOffset : slidesToShow + dayOffset - 1;
  }
  console.log("Initial currentIndex:", currentIndex);

  function updateSlider() {
    // Na mobil odmah modulo uveravamo currentIndex da bude u [0, originalCount-1]
    if (slidesToShow === 1) {
      currentIndex =
        ((currentIndex % originalCount) + originalCount) % originalCount;
    }

    const sliderContainer = document.querySelector(".slider");
    const computedGap =
      parseFloat(
        getComputedStyle(document.querySelector(".slider-track")).gap
      ) || 0;
    const cellWidth =
      (sliderContainer.clientWidth - (slidesToShow - 1) * computedGap) /
      slidesToShow;
    track.style.transform = `translateX(-${
      currentIndex * (cellWidth + computedGap)
    }px)`;

    if (slidesToShow === 3) {
      slides.forEach((slide) =>
        slide.classList.remove("left", "center", "right")
      );
      const centerIndex = currentIndex + 1;
      if (centerIndex < slides.length)
        slides[centerIndex].classList.add("center");
      if (currentIndex < slides.length)
        slides[currentIndex].classList.add("left");
      if (currentIndex + slidesToShow - 1 < slides.length)
        slides[currentIndex + slidesToShow - 1].classList.add("right");

      const info = document.getElementById("slide-info");
      if (info && centerIndex < slides.length) {
        const dayText = `${slides[centerIndex].dataset.day}. april`;
        const titleText = slides[centerIndex].dataset.title || "";
        info.innerHTML = slides[centerIndex].classList.contains("no-click")
          ? `<div class="slide-info"><span class="date">${dayText}</span></div>`
          : `<div class="slide-info"><span class="date">${dayText}</span><br><span class="title">${titleText}</span></div>`;
      }
    } else {
      const info = document.getElementById("slide-info");
      if (info) {
        const firstIndex = currentIndex;
        const dayText = `${slides[firstIndex].dataset.day}. april 2025`;
        const titleText = slides[firstIndex].dataset.title || "";
        // Za mobil/tabla: čak i ako je zaključan (no-click), prikaži datum
        info.innerHTML = `<div class="slide-info"><span class="date">${dayText}</span>${
          slides[firstIndex].classList.contains("no-click")
            ? ""
            : `<br><span class="title">${titleText}</span>`
        }</div>`;
      }
      slides.forEach((slide) =>
        slide.classList.remove("center", "left", "right")
      );
    }
  }

  updateSlider();

  // Transitionend handler – unificirana logika za infinite wrap-around za sve uređaje
  track.addEventListener("transitionend", () => {
    slides = document.querySelectorAll(".slide");
    let minIndex, maxIndex;
    if (slidesToShow === 1) {
      // Mobil: validni indeksi 0 ... originalCount - 1
      minIndex = 0;
      maxIndex = originalCount - 1;
    } else {
      // Desktop: validni indeksi slidesToShow ... slidesToShow + originalCount - 1
      minIndex = slidesToShow;
      maxIndex = slidesToShow + originalCount - 1;
    }
    console.log(
      "Transition ended. currentIndex:",
      currentIndex,
      "minIndex:",
      minIndex,
      "maxIndex:",
      maxIndex
    );
    if (currentIndex < minIndex) {
      console.log("Wrap-around triggered (left). Old index:", currentIndex);
      currentIndex = maxIndex;
      track.style.transition = "none";
      updateSlider();
      setTimeout(() => {
        track.style.transition = "transform 0.5s ease";
      }, 20);
    }
    if (currentIndex > maxIndex) {
      console.log("Wrap-around triggered (right). Old index:", currentIndex);
      currentIndex = minIndex;
      track.style.transition = "none";
      updateSlider();
      setTimeout(() => {
        track.style.transition = "transform 0.5s ease";
      }, 20);
    }
    console.log("After transition, currentIndex:", currentIndex);
  });

  // Strelice za desktop
  if (window.innerWidth >= 769) {
    const arrowLeft = document.querySelector(".arrow.left");
    const arrowRight = document.querySelector(".arrow.right");
    arrowLeft.addEventListener("click", () => {
      currentIndex--;
      updateSlider();
    });
    arrowRight.addEventListener("click", () => {
      currentIndex++;
      updateSlider();
    });
  }

  // Swipe gestovi – registruj na .slider kako bi slušali sve touch događaje
  if (window.innerWidth <= 768) {
    let startX = 0,
      endX = 0;
    const swipeThresh = 50;
    document.querySelector(".slider").addEventListener("touchstart", (e) => {
      startX = e.changedTouches[0].screenX;
    });
    document.querySelector(".slider").addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].screenX;
      const delta = startX - endX;
      if (Math.abs(delta) > swipeThresh) {
        currentIndex += delta > 0 ? 1 : -1;
        // Primeni modulo odmah
        currentIndex =
          ((currentIndex % originalCount) + originalCount) % originalCount;
        console.log("Touch swipe: new currentIndex:", currentIndex);
        updateSlider();
      }
    });
  }

  track.style.transition = "transform 0.5s ease";
  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWindowWidth) {
      lastWindowWidth = window.innerWidth;
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.location.reload();
      }, 300); // reload nakon 300ms ako se širina stabilizuje
    }
  });
  
});
