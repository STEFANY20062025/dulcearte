  const carouselInner = document.querySelector('.carousel-inner');
  const slides = document.querySelectorAll('.carousel-inner img, .carousel-inner video');
  let currentIndex = 0;

  // Ajustar el ancho del carrusel dinámicamente
  carouselInner.style.width = `${slides.length * 100}%`;
  slides.forEach(slide => {
    slide.style.width = `${100 / slides.length}%`;
  });

  function updateCarousel() {
    carouselInner.style.transition = 'transform 0.5s ease-in-out';
    carouselInner.style.transform = `translateX(-${currentIndex * (100 / slides.length)}%)`;

    // Pausar todos los videos y solo reproducir el del slide activo
    slides.forEach((slide, index) => {
      if (slide.tagName === "VIDEO") {
        if (index === currentIndex) {
          slide.play();
        } else {
          slide.pause();
        }
      }
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  }

  document.querySelector('.next').addEventListener('click', nextSlide);
  document.querySelector('.prev').addEventListener('click', prevSlide);


  setInterval(nextSlide, 6000);

  updateCarousel();
