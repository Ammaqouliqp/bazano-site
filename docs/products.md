Here is the complete documentation in clean **Markdown format** — perfect for saving as a file like `README-dynamic-products.md` or uploading to Google Docs / Notion / documents.me.  
Just copy-paste everything below:

```markdown
# Bazano Site – Dynamic Products Documentation

**Project:** Bazano E-commerce Website (بازانو)  
**Version:** 1.0 (Dynamic Products)  
**Date:** December 29, 2025  
**Goal:** Convert the static `products.html` page to load real products dynamically from SQLite database while keeping the original design 100% intact.

---

## 1. Folder Structure (Must Be Exactly Like This)

```
Baza-no/                          ← Main project root
├── products.html                 ← Main products page
├── index.html
├── about.html
├── cart.html
├── single-product.html
├── assets/
│   ├── img/
│   │   └── products/             ← Images: product-img-1.jpg, product-img-2.jpg, ...
│   ├── css/
│   ├── js/
│   ├── bootstrap/
│   ├── scss/
│   └── webfonts/
└── code/                         ← Backend folder (Node.js server)
    ├── app.js                    ← Main server file
    ├── package.json              ← Dependencies
    └── data/
        └── database.db           ← SQLite database file
```

**Critical**: The `code` folder must be at the same level as `products.html` and `assets`.

---

## 2. Backend Setup (`code` folder)

### `code/package.json`
```json
{
  "name": "bazano-site",
  "version": "1.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.7"
  }
}
```

### `code/app.js` (Complete Server Code)
```js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Serve static files from project root (HTML, CSS, images, etc.)
app.use(express.static(path.join(__dirname, '..')));

// Connect to SQLite database
const dbPath = path.join(__dirname, 'data', 'database.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Cannot connect to database:', err.message);
  } else {
    console.log('Connected to database successfully.');
  }
});

// API: Get all products
app.get('/api/products', (req, res) => {
  const query = `
    SELECT id, brand, name, description, price_exit, category, quantity 
    FROM products 
    ORDER BY id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // Format data for frontend
    rows.forEach(row => {
      row.price_exit_formatted = Number(row.price_exit).toLocaleString('fa-IR') + ' تومان';
      row.full_title = row.brand ? `${row.brand} ${row.name}` : row.name;
      row.image = `assets/img/products/product-img-${row.id}.jpg`;
    });

    res.json(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running!`);
  console.log(`🌐 Open site: http://localhost:${PORT}/products.html`);
  console.log(`🔍 Test API: http://localhost:${PORT}/api/products\n`);
});
```

---

## 3. How to Run the Site

1. Open terminal and go to the `code` folder:
   ```bash
   cd path/to/Baza-no/code
   ```
2. Install dependencies (run once):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open browser → **http://localhost:3000/products.html**

You will see real products loaded from the database.

---

## 4. Database Requirements

- File: `code/data/database.db`
- Table: `products`
- Required columns:
  - `id` → Used for image filename and links
  - `brand` (TEXT)
  - `name` (TEXT)
  - `price_exit` (REAL) → Selling price
  - `category` (TEXT) → For future filtering
  - `description`, `quantity` → Available for future features

**Image Naming Rule**:  
Product with `id = 7` → Image must be:  
`assets/img/products/product-img-7.jpg`

---

## 5. Products Section in `products.html` (Clean Dynamic Version)

Replace the old products section with this:

```html
<!-- products -->
<div class="product-section mt-150 mb-150">
	<div class="container">

		<!-- Category Filters (ready for future dynamic categories) -->
		<div class="row">
            <div class="col-md-12">
                <div class="product-filters">
                    <ul>
                        <li class="active" data-filter="*">همه</li>
                        <!-- Add real categories here later -->
                    </ul>
                </div>
            </div>
        </div>

		<!-- Dynamic Product List -->
		<div class="row product-lists" id="product-lists-container">
			<div class="col-12 text-center">
				<p>در حال بارگذاری محصولات...</p>
			</div>
		</div>

		<!-- Pagination (ready for future use) -->
		<div class="row mt-50">
			<div class="col-lg-12 text-center">
				<div class="pagination-wrap">
					<ul>
						<li><a href="#">بعدی</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- end products -->
```

---

## 6. Dynamic Loading Script (Place Before `</body>` Tag)

```html
<!-- Dynamic Products Loading Script -->
<script>
	async function loadProductsFromDB() {
		try {
			const response = await fetch('/api/products');
			if (!response.ok) throw new Error('خطا در دریافت اطلاعات');

			const products = await response.json();

			const container = document.getElementById('product-lists-container');
			container.innerHTML = '';

			if (products.length === 0) {
				container.innerHTML = '<div class="col-12 text-center"><p>محصولی یافت نشد.</p></div>';
				return;
			}

			products.forEach(product => {
				let filterClass = '';
				const cat = product.category?.toLowerCase() || '';
				if (cat.includes('strawberry')) filterClass = 'strawberry';
				else if (cat.includes('berry')) filterClass = 'berry';
				else if (cat.includes('lemon')) filterClass = 'lemon';

				const colDiv = document.createElement('div');
				colDiv.className = `col-lg-4 col-md-6 text-center ${filterClass}`;

				colDiv.innerHTML = `
					<div class="single-product-item">
						<div class="product-image">
							<a href="single-product.html?id=${product.id}">
								<img src="${product.image}" alt="${product.full_title}">
							</a>
						</div>
						<h3>${product.full_title}</h3>
						<p class="product-price">
							<span>قیمت</span> ${product.price_exit_formatted}
						</p>
						<a href="cart.html?add=${product.id}" class="cart-btn">
							<i class="fas fa-shopping-cart"></i> افزودن به سبد
						</a>
					</div>
				`;

				container.appendChild(colDiv);
			});

			// Re-initialize Isotope if theme uses filtering
			if (typeof $.fn.isotope !== 'undefined') {
				$('.product-lists').isotope('reloadItems').isotope();
			}

		} catch (err) {
			console.error('خطا در بارگذاری محصولات:', err);
			const container = document.getElementById('product-lists-container');
			container.innerHTML = '<div class="col-12 text-center"><p>خطایی رخ داد. لطفاً صفحه را رفرش کنید.</p></div>';
		}
	}

	document.addEventListener('DOMContentLoaded', loadProductsFromDB);
</script>
```

---

## 7. How to Add a New Product

1. Add a new row in `database.db` → table `products` with correct `id`
2. Save product image as:  
   `assets/img/products/product-img-[NEW_ID].jpg`
3. Refresh `products.html` → New product appears automatically!

---

## 8. Future Features (Easy to Add)

- Dynamic category filters from database
- Real pagination (page 1, 2, 3...)
- Search bar
- Stock/quantity display
- Admin panel for managing products

---

**Your site is now fully dynamic, clean, and professional!**  
All original design preserved — only real products from your database are shown.
