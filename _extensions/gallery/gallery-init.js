document.addEventListener('DOMContentLoaded', function () {
    // Initialize lightbox for gallery images
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.classList.add('lightbox');
    });
});
