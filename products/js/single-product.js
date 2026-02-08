document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) {
    alert('محصول یافت نشد');
    window.location.href = '../index.html';
    return;
  }

  try {
    const product = await apiFetch(`/products/${productId}`);

    document.getElementById('product-name').textContent = product.name || 'بدون نام';
    document.getElementById('product-description').textContent = product.description || 'بدون توضیح';
    document.getElementById('product-price').textContent = 
      product.price_exit ? Number(product.price_exit).toLocaleString('fa-IR') + ' تومان' : 'نامشخص';
    document.getElementById('product-brand').textContent = product.brand || '-';
    document.getElementById('product-category').textContent = product.category || '-';
    document.getElementById('product-quantity').textContent = product.quantity || 0;

    const imageContainer = document.querySelector('.product-images');
    const imgElement = document.getElementById('product-image');

    if (product.image && product.image.trim() !== '') {
      imgElement.src = product.image.trim();
      imgElement.alt = product.name || 'محصول';
      imageContainer.style.display = 'block';
    } else {
      imageContainer.style.display = 'none';
    }

    document.getElementById('add-to-cart').addEventListener('click', () => {
      const message = document.getElementById('add-message');
      message.textContent = 'محصول به سبد خرید اضافه شد!';
      message.style.color = '#28a745';
      message.style.display = 'block';
      setTimeout(() => message.style.display = 'none', 3000);
    });

  } catch (err) {
    console.error('Error:', err);
    alert('محصول یافت نشد یا خطا در بارگذاری');
    window.location.href = '../index.html';
  }
});