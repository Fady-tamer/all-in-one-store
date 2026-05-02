import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf752ew03x5SlNn1dzqlh82SOKFNm3H68",
    authDomain: "software-project-allinone.firebaseapp.com",
    projectId: "software-project-allinone",
    storageBucket: "software-project-allinone.firebasestorage.app",
    messagingSenderId: "634736246042",
    appId: "1:634736246042:web:9ad6a1b7401e9408c280a3",
    measurementId: "G-9JXFZCVZWG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsRef = collection(db, "products");

// ==========================================
//  ADD NEW PRODUCT TO DATABASE
// ==========================================

const addForm = document.getElementById('add-product-form');

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('new-name').value;
    const price = parseFloat(document.getElementById('new-price').value);
    const available = parseInt(document.getElementById('new-qty').value);
    const image = document.getElementById('new-image').value;

    try {
        await addDoc(productsRef, {
            name: name,
            price: price,
            available: available,
            image: image
        });
        
        alert(`${name} added to inventory!`);
        addForm.reset();
    } catch (error) {
        alert("Error adding product: " + error.message);
    }
});

// ==========================================
// 2. READ & RENDER INVENTORY (REAL-TIME)
// ==========================================

const inventoryContainer = document.getElementById('inventory-container');

onSnapshot(productsRef, (snapshot) => {
    inventoryContainer.innerHTML = "";

    snapshot.forEach((firestoreDoc) => {
        const product = firestoreDoc.data();
        const docId = firestoreDoc.id;

        const itemHTML = `
            <div class="inventory-item">
                <img src="${product.image}" alt="${product.name}">
                
                <div class="item-details">
                    <h3>${product.name}</h3>
                    <p>Available: ${product.available}</p>
                </div>

                <div class="item-actions">
                    <input type="number" class="update-price-input" id="price-${docId}" value="${product.price}" step="0.01">
                    <button class="btn-update" data-id="${docId}">Update Price</button>
                    
                    <button class="btn-delete" data-id="${docId}">Delete</button>
                </div>
            </div>
        `;
        inventoryContainer.innerHTML += itemHTML;
    });
});

// ==========================================
//  EVENT DELEGATION FOR UPDATE & DELETE
// ==========================================

inventoryContainer.addEventListener('click', async (event) => {
    
    if (event.target.classList.contains('btn-delete')) {
        const docId = event.target.getAttribute('data-id');
        
        if (confirm("Are you sure you want to delete this item completely?")) {
            try {
                await deleteDoc(doc(db, "products", docId));
            } catch (error) {
                alert("Error deleting: " + error.message);
            }
        }
    }

    if (event.target.classList.contains('btn-update')) {
        const docId = event.target.getAttribute('data-id');
        
        const newPriceValue = document.getElementById(`price-${docId}`).value;
        const newPrice = parseFloat(newPriceValue);

        try {
            const productDocRef = doc(db, "products", docId);
            await updateDoc(productDocRef, {
                price: newPrice
            });
            
            const originalText = event.target.innerText;
            event.target.innerText = "Updated!";
            event.target.style.backgroundColor = "green";
            setTimeout(() => {
                event.target.innerText = originalText;
                event.target.style.backgroundColor = "#2f88ff";
            }, 1500);

        } catch (error) {
            alert("Error updating price: " + error.message);
        }
    }
});

// ==========================================
//  READ INCOMING ORDERS (REAL-TIME)
// ==========================================

const ordersContainer = document.getElementById('orders-container');
const ordersRef = collection(db, "orders");

onSnapshot(ordersRef, (snapshot) => {
    ordersContainer.innerHTML = "";

    if (snapshot.empty) {
        ordersContainer.innerHTML = "<p>No incoming orders yet.</p>";
        return;
    }

    snapshot.forEach((firestoreDoc) => {
        const order = firestoreDoc.data();
        
        const itemNames = order.items.map(item => `${item.name} (x${item.quantity || 1})`).join(", ");

        const orderHTML = `
            <div class="inventory-item" style="border-left: 5px solid var(--second-color);">
                <div class="item-details" style="margin-left: 0;">
                    <h3 style="color: #333;">Order from: ${order.userEmail}</h3>
                    <p><strong>Date:</strong> ${order.date}</p>
                    <p><strong>Items:</strong> ${itemNames}</p>
                    <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
                </div>
                <div class="item-actions">
                    <span style="background-color: var(--second-color); padding: 5px 10px; border-radius: 5px; font-weight: bold; color: black;">
                        ${order.status}
                    </span>
                </div>
            </div>
        `;
        ordersContainer.innerHTML += orderHTML;
    });
});