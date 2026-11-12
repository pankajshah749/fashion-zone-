# Fashion Zone

A full-stack e-commerce clothing website built with **React.js + Vite** and **Django + Django REST Framework**.

## Main Features
- Professional responsive storefront
- Product catalog with categories, search, filtering and sorting
- Product details with size/color selection
- Shopping cart
- Wishlist
- User registration, login and JWT authentication
- Checkout and order creation
- Address management
- Order history
- Django admin dashboard for products, categories and orders
- REST API ready for React frontend
- Responsive UI with Tailwind CSS

## Folder Structure
- `frontend/` React.js + Vite + Tailwind CSS
- `backend/` Django + Django REST Framework

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py seed_store
python manage.py createsuperuser
python manage.py runserver
```

The `seed_store` command adds four categories, 132 searchable products across clothing, shoes, bags, and accessories, a demo customer, two addresses, and three sample orders. Every product includes a description, pricing, sizes or color options, stock, and a featured flag. It is safe to run again because it updates the existing sample records instead of creating duplicates.

Demo customer login: `demo_customer` / `demo12345`

Product search examples:
```text
/api/products/?search=shoe
/api/products/?category=clothing
/api/products/?search=linen&ordering=price
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the frontend at the Vite URL, usually `http://localhost:5173`.
Django admin: `http://127.0.0.1:8000/admin/`
