// assets/js/products.js - Clean product loading for index.html

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('product-lists-container');
  if (!container) return;

  try {
    const products = await apiFetch('/products'); // Uses utils.js apiFetch

    container.innerHTML = ''; // Clear loading

    if (!products || products.length === 0) {
      container.innerHTML = '<div class="col-12 text-center"><p>محصولی یافت نشد.</p></div>';
      return;
    }

    products.forEach(product => {
      // Category filter class (customize as needed)
      let filterClass = 'all';
      const cat = (product.category || '').toLowerCase();
      if (cat.includes('strawberry')) filterClass = 'strawberry';
      else if (cat.includes('berry')) filterClass = 'berry';
      else if (cat.includes('lemon')) filterClass = 'lemon';

      const colDiv = document.createElement('div');
      colDiv.className = `col-lg-4 col-md-6 text-center ${filterClass}`;

      colDiv.innerHTML = `
        <div class="single-product-item">
          <div class="product-image">
            <a href="../products/single-product.html?id=${product.id}">
              <img src="${product.image || '../assets/img/no-image.jpg'}" alt="${product.name || 'محصول'}">
            </a>
          </div>
          <h3>${product.name || 'بدون نام'}</h3>
          <p class="product-price">
            <span>قیمت</span> ${product.price_exit ? Number(product.price_exit).toLocaleString('fa-IR') + ' تومان' : 'نامشخص'}
          </p>
          <a href="cart.html?add=${product.id}" class="cart-btn">
            <i class="fas fa-shopping-cart"></i> افزودن به سبد
          </a>
        </div>
      `;

      container.appendChild(colDiv);
    });

    // Re-init Isotope if available
    if (typeof $.fn.isotope !== 'undefined') {
      $('.product-lists').isotope('reloadItems').isotope();
    }

  } catch (err) {
    console.error('Error loading products:', err);
    container.innerHTML = '<div class="col-12 text-center text-danger"><p>خطا در بارگذاری محصولات</p></div>';
  }
});