# E-commerce Fullstack Website

This project is a full-stack e-commerce web application built using Django REST Framework for the backend and Vue.js with Vuex for the frontend. It demonstrates key e-commerce features including product browsing, filtering, cart management, user authentication via OTP (mocked), and order placement.

---

## Features

### Backend (Django)
- REST API endpoints for users, products, carts, and orders
- Mocked OTP login for demo user authentication
- Product filtering by category, price range, sale status, and search
- Cart functionality: add, update quantities, remove items, clear cart
- Order management: place orders based on cart, view and cancel orders
- Admin panel for managing products and orders (Django admin)
- Demo mode support using a single demo user for easy testing

### Frontend (Vue.js)
- Responsive product listing with grid layout
- Category sidebar with filters and price range slider
- Debounced search input for live product filtering
- Shopping cart UI with quantity controls and summary
- User login via mobile OTP input (mocked for demo)
- Order placement and order history display
- Vuex for state management and axios for API communication
- Deployed frontend on Netlify, backend on PythonAnywhere

---

## Technologies Used

- Backend: Python, Django, Django REST Framework, SQLite/PostgreSQL
- Frontend: Vue.js 3, Vuex, Vue Router, Axios, CSS Grid/Flexbox
- Deployment: Netlify (Frontend), PythonAnywhere (Backend)

---

## Setup Instructions

### Backend

1. Clone the repository and navigate to `backend` folder.
2. Create and activate a virtual environment:
python -m venv venv
source venv/bin/activate # Linux/macOS
venv\Scripts\activate # Windows

3. Install dependencies:
pip install -r requirements.txt

4. Apply database migrations:
python manage.py migrate

5. Run the development server:
python manage.py runserver



### Frontend

1. Navigate to the `frontend` folder.
2. Install dependencies:
npm install

3. Run the development server:
npm run serve

4. Access the frontend at `http://localhost:8080`.

---

## Usage

- Login using any mobile number and OTP `123456` (mocked for demo).
- Browse and filter products.
- Add products to the cart and manage quantities.
- Place orders and view order history.
- Cancel orders if needed.

---

## Known Limitations

- OTP login is mocked and not integrated with real SMS providers.
- Payment gateway integration is not included; orders default to Cash on Delivery mode.
- No wishlist or product reviews implemented.
- Admin panel uses default Django admin without customization.
- Basic input validation with minimal error handling.
- No automated tests included.

---

## Links

- GitHub Repository: [https://github.com/tiyabhattacharya/e-commerce_website](https://github.com/tiyabhattacharya/e-commerce_website)
- Deployed Frontend: [https://playful-gingersnap-f3ff34.netlify.app/](https://playful-gingersnap-f3ff34.netlify.app/)

---

## License

This project is for educational and demonstration purposes.

---

Feel free to contribute or report issues.

