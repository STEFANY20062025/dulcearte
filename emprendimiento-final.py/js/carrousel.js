const carouselInner = document.querySelector('.carousel-inner');
const images = document.querySelectorAll('.carousel-inner img');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let currentIndex = 0;


carouselInner.style.width = `${images.length * 100}%`;
images.forEach(img => {
    img.style.width = `${100 / images.length}%`;
});

function updateCarousel() {
    carouselInner.style.transition = 'transform 0.5s ease-in-out';
    carouselInner.style.transform = `translateX(-${currentIndex * (100 / images.length)}%)`;
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
}

nextButton.addEventListener('click', nextImage);
prevButton.addEventListener('click', prevImage);


setInterval(nextImage, 4000);
