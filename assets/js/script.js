import promotions from "./promotions.js";
import specialPromotion from "./specialPomotion.js";

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

/* Datum promocije */
const promotionStartDate = new Date(2025,7, 1);
const promotionEndDate = new Date(2025, 11, 32);
const originalCount =
  promotionEndDate.getDate() - promotionStartDate.getDate() + 1;

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
  
      let   dayOfWeek = currentDate.getDay() || 7;
  
      const promo =
        dayNumber === 30
          ? specialPromotion
          : promotions[(dayOfWeek - 1) % promotions.length];
  
      const slide = document.createElement("div");
      slide.classList.add("slide");
      slide.dataset.day = dayNumber;
      slide.dataset.dayOfWeek = dayOfWeek;
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
  

function cloneSlides(slidesToShow) {
  if (slidesToShow === 1) return;
  const sliderTrack = document.querySelector(".slider-track");
  const slides = Array.from(sliderTrack.querySelectorAll(".slide"));
  slides.slice(-slidesToShow).forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("clone");
    sliderTrack.insertBefore(clone, sliderTrack.firstChild);
  });
  slides.slice(0, slidesToShow).forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.classList.add("clone");
    sliderTrack.appendChild(clone);
  });
}

document.querySelector(".slider-track").addEventListener("click", function (e) {
  const slide = e.target.closest(".slide");
  if (!slide) return;

  const dayNumber = parseInt(slide.dataset.day, 10);
  let promo;
  if (dayNumber === 30) {
    promo = specialPromotion;
  } else {
    const dayOfWeek = parseInt(slide.dataset.dayOfWeek, 10);
    promo = promotions[(dayOfWeek - 1) % promotions.length];
  }

  const popupContent = `
    <div class="header-flex">
      <h2><i>${promo.title}</i></h2>
    </div>
    <ul class="list-top">
    ${promo.description
      .map(
        (item) => `
      <div class="list-rules">
        <i class="fa-solid fa-check"></i>
        <li>${item}</li>
      </div>
    `
      )
      .join("")}
</ul>
   <ul class="list-top">
  <h3>${promo.subtitle}</h3>
  ${promo.description1
    .map(
      (item) => `
    <div class="list-rules">
      <i class="fa-solid fa-check"></i>
      <li>${item}</li>
    </div>
  `
    )
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

  const slidesToShow = window.innerWidth < 480 ? 1 : 3;
  cloneSlides(slidesToShow);

  const track = document.querySelector(".slider-track");
  let slides = document.querySelectorAll(".slide");

  const originalSlides = Array.from(slides)
  .filter(s => !s.classList.contains("clone"));
const todayDay       = new Date().getDate();
let   realIndex      =
  originalSlides.findIndex(s => +s.dataset.day === todayDay);
if (realIndex < 0) realIndex = 0;

// if mobile: show that slide itself; if desktop: center it (shift left by slidesToShow-1)
let currentIndex = slidesToShow === 1
  ? realIndex
  : realIndex + (slidesToShow - 1);
console.log("Initial currentIndex:", currentIndex);

  function updateSlider() {
    const sliderContainer = document.querySelector(".slider");
    const gap =
      parseFloat(
        getComputedStyle(document.querySelector(".slider-track")).gap
      ) || 0;
    const cellWidth =
      (sliderContainer.clientWidth - (slidesToShow - 1) * gap) / slidesToShow;
    track.style.transform = `translateX(-${
      currentIndex * (cellWidth + gap)
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
        const dayText = `<span class="day-number">${slides[centerIndex].dataset.day}. </span></br>avgust`;
        const titleText = slides[centerIndex].dataset.title || "";
        info.innerHTML = slides[centerIndex].classList.contains("no-click")
          ? `<div class="slide-info"><span class="date">${dayText}</span></div>`
          : `<div class="slide-info"><span class="date">${dayText}</span><br><span class="title">${titleText}</span></div>`;
      }
    } else {
      const info = document.getElementById("slide-info");
      if (info && slides.length > 0) {
        const firstIndex = currentIndex;
        const dayText = `<span class="day-number">${slides[firstIndex].dataset.day}.</span><br/> april`;
        const titleText = slides[firstIndex].dataset.title || "";
        info.innerHTML = `<div class="slide-info"><span class="date">${dayText}</span>${
          slides[firstIndex].classList.contains("no-click")
            ? ""
            : `<br><span class="title">${titleText}</span>`
        }</div>`;
      }
      slides.forEach((slide) =>
        slide.classList.remove("left", "center", "right")
      );
    }
  }

  updateSlider();

  track.addEventListener("transitionend", () => {
    slides = document.querySelectorAll(".slide");
    let minIndex, maxIndex;
    if (slidesToShow === 1) {
      minIndex = 0;
      maxIndex = originalCount - 1;
    } else {
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

  // Strelice (desktop)
  if (window.innerWidth >= 500) {
    document.querySelector(".arrow.left").addEventListener("click", () => {
      currentIndex--;
      updateSlider();
    });
    document.querySelector(".arrow.right").addEventListener("click", () => {
      currentIndex++;
      updateSlider();
    });
  }

  if (window.innerWidth < 768) {
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
      }, 300);
    }
  });
});

function autoSlide(swiperContainer) {
  const wrapper = swiperContainer.querySelector(".swiper-wrapper");
  const slides = swiperContainer.querySelectorAll(".swiper-slide");
  const slideWidth = slides[0].offsetWidth;
  let currentPosition = 0;

  function moveSlides() {
    currentPosition -= 1;
    wrapper.style.transform = `translateX(${currentPosition}px)`;

    if (Math.abs(currentPosition) >= slideWidth) {
      currentPosition = 0;
      wrapper.style.transition = "none";
      wrapper.appendChild(wrapper.firstElementChild);
      wrapper.style.transform = `translateX(${currentPosition}px)`;
    }
  }

  setInterval(moveSlides, 30);
}
const swiperContainers = document.querySelectorAll(".swiper-container");
swiperContainers.forEach(autoSlide);
