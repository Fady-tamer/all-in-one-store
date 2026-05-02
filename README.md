# 🛒 ALL - IN - ONE

A full-stack grocery e-commerce web application built with vanilla JavaScript and Firebase.

---

## 📌 Overview

**ALL IN ONE** is an online grocery store where customers can browse products, manage their cart, and place orders in real time. It also includes an admin panel for managing inventory and tracking incoming orders.

---

## ✨ Features

### 👤 Customer Side
- **Authentication** — Sign up and log in securely with Firebase Auth
- **Product Catalog** — Browse products loaded in real-time from Firestore
- **Smart Cart** — Add items with quantity control, duplicate detection, and stock validation
- **Checkout** — Place orders with automatic inventory deduction and order logging
- **Real-time Cart Counter** — Cart badge updates instantly without page refresh

### 🛠️ Admin Side
- **Add Products** — Add new items with name, price, quantity, and image URL
- **Manage Inventory** — Update prices or delete products from the database
- **Live Orders** — View incoming customer orders in real time

---

## 🗂️ Project Structure

```
├── index.html          # Login / Sign Up page
├── home.html           # Main store page
├── cart.html           # Shopping cart page
├── storage.html        # Admin panel page
├── scripts/
│   ├── script.js       # Authentication logic
│   ├── home.js         # Product display & cart logic
│   ├── cart.js         # Cart management & checkout
│   └── storage.js      # Admin inventory & orders
└── styles/
    ├── global.css      # Shared styles & variables
    ├── style.css       # Auth page styles
    ├── home.css        # Store page styles
    ├── cart.css        # Cart page styles
    └── storage.css     # Admin panel styles
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend / Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Icons | Font Awesome 7 |
| Fonts | Google Fonts (Supermercado One) |

---

## 🗄️ Database Structure (Firestore)

```
firestore/
├── users/
│   └── {userId}/
│       ├── fullName, email, role, createdAt
│       └── cart/
│           └── {cartItemId}/
│               └── name, price, image, quantity, addedAt
├── products/
│   └── {productId}/
│       └── name, price, available, image
└── orders/
    └── {orderId}/
        └── userId, userEmail, items[], totalAmount, status, date
```

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/all-in-one.git
   cd all-in-one
   ```

2. **Set up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable **Authentication** (Email/Password) and **Firestore Database**
   - Replace the `firebaseConfig` object in all script files with your own config

3. **Run the project**
   - Open `index.html` in your browser, or use a live server extension (e.g., VS Code Live Server)

> ⚠️ No build tools or npm install required — runs directly in the browser!

---

## 👥 Team

| Name | Role |
|---|---|
| Fady Tamer | Frontend Development & Firebase Integration |
| Adham | System Design, Flowcharts, Diagrams & Database Schema |

---

## 📄 License

This project is for educational purposes. Feel free to use and modify it.
