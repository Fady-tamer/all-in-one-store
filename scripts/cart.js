import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, deleteDoc, doc, getDocs, addDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf752ew03x5SlNn1dzqlh82SOKFNm3H68",
    authDomain: "software-project-allinone.firebaseapp.com",
    projectId: "software-project-allinone",
    storageBucket: "software-project-allinone.firebasestorage.app",
    messagingSenderId: "634736246042",
    appId: "1:634736246042:web:9ad6a1b7401e9408c280a3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
const deliveryFee = 5.00;

// ==========================================
//  CHECK AUTH & LOAD CART
// ==========================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadCartItems();
    } else {
        window.location.href = "index.html";
    }
});

function loadCartItems() {
    const cartContainer = document.getElementById('cart-container');
    const cartRef = collection(db, "users", currentUser.uid, "cart");

    onSnapshot(cartRef, (snapshot) => {
        cartContainer.innerHTML = ""; 
        let subtotal = 0;
        let totalItems = 0;

        if (snapshot.empty) {
            cartContainer.innerHTML = `<div class="empty-cart">Your cart is completely empty!</div>`;
            updateTotals(0, 0);
            return;
        }

        snapshot.forEach((firestoreDoc) => {
            const item = firestoreDoc.data();
            const docId = firestoreDoc.id;
            
            const itemQty = item.quantity || 1; 
            const itemTotal = item.price * itemQty;
            
            subtotal += itemTotal;
            totalItems += itemQty;

            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-info">
                        <h3>${item.name} <span style="font-size: 0.8em; color: gray;">(x${itemQty})</span></h3>
                        <p>$${item.price.toFixed(2)} each</p>
                    </div>
                    <div style="font-weight: bold; margin-right: 15px;">
                        $${itemTotal.toFixed(2)}
                    </div>
                    <button class="remove-btn" data-id="${docId}">Remove</button>
                </div>
            `;
            cartContainer.innerHTML += itemHTML;
        });

        updateTotals(subtotal, totalItems);
    });
}

// ==========================================
//  UPDATE MATH/TOTALS
// ==========================================

function updateTotals(subtotal, totalItems) {
    document.getElementById('cart-counter').innerText = totalItems;
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    const finalTotal = subtotal > 0 ? (subtotal + deliveryFee) : 0;
    document.getElementById('cart-total').innerText = `$${finalTotal.toFixed(2)}`;
}

// ==========================================
//  REMOVE ITEMS FROM CART
// ==========================================
const cartContainer = document.getElementById('cart-container');

cartContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const docId = event.target.getAttribute('data-id');
        try {
            await deleteDoc(doc(db, "users", currentUser.uid, "cart", docId));
        } catch (error) {
            alert("Error removing item: " + error.message);
        }
    }
});

// ==========================================
//  CHECKOUT LOGIC (NEW!)
// ==========================================
document.getElementById('checkout-btn').addEventListener('click', async () => {
    const totalText = document.getElementById('cart-total').innerText;
    
    if (totalText === "$0.00") {
        return alert("Your cart is empty!");
    }

    const confirmCheckout = confirm(`Are you sure you want to place this order for ${totalText}?`);
    if (!confirmCheckout) return;

    try {
        const cartRef = collection(db, "users", currentUser.uid, "cart");
        const cartSnapshot = await getDocs(cartRef);
        
        let orderItems = [];
        let rawTotal = 0;

        for (const cartDoc of cartSnapshot.docs) {
            const itemData = cartDoc.data();
            orderItems.push(itemData);
            rawTotal += itemData.price;

            const productQuery = query(collection(db, "products"), where("name", "==", itemData.name));
            const productSnapshot = await getDocs(productQuery);
            
            if (!productSnapshot.empty) {
                const productDoc = productSnapshot.docs[0];
                const currentStock = productDoc.data().available;
                
                const newStock = currentStock > 0 ? currentStock - 1 : 0;
                await updateDoc(doc(db, "products", productDoc.id), {
                    available: newStock
                });
            }

            await deleteDoc(doc(db, "users", currentUser.uid, "cart", cartDoc.id));
        }

        await addDoc(collection(db, "orders"), {
            userEmail: currentUser.email,
            userId: currentUser.uid,
            items: orderItems,
            totalAmount: rawTotal + deliveryFee,
            status: "New Order",
            date: new Date().toLocaleString()
        });

        alert("Order placed successfully! The store has received your order.");

    } catch (error) {
        alert("Error placing order: " + error.message);
    }
});