import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

// ==========================================
//  CHECK USER LOGIN STATUS
// ==========================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        startCartListener();
    } else {
        currentUser = null;
        document.querySelector('.user .cart span').innerText = "0";
    }
});

// ==========================================
//  FETCH AND DISPLAY PRODUCTS FROM DATABASE
// ==========================================

async function loadProducts() {
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = "<p>Loading products...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            
            let buttonHTML = '';
            if (product.available <= 0) {
                buttonHTML = `<button class="add-btn out-of-stock" disabled data-available="0" style="background-color: #ccc; color: #666; cursor: not-allowed; width: 100%; border-radius: 10px; padding: 15px 20px;">Out of Stock</button>`;
            } else {
                buttonHTML = `
                    <div class="item-actions">
                        <input type="number" class="qty-input" value="1" min="1" max="${product.available}">
                        <button class="add-btn" data-available="${product.available}">Add to cart</button>
                    </div>
                `;
            }
            
            const productHTML = `
                <div class="item">
                    <p>available: ${product.available}</p>
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>250 gm</p>
                    <h4>${product.price} $</h4>
                    ${buttonHTML}
                </div>
            `;
            productsContainer.innerHTML += productHTML;
        });
    } catch (error) {
        console.error("Error loading products:", error);
        productsContainer.innerHTML = "<p>Failed to load products.</p>";
    }
}

loadProducts();


// ==========================================
//  ADD TO CART FUNCTIONALITY (Event Delegation)
// ==========================================

const productsContainer = document.getElementById('products-container');

productsContainer.addEventListener('click', async (event) => {
    if (event.target.classList.contains('add-btn')) {
        const button = event.target;

        if (button.disabled) {
            return; 
        }
        
        if (!currentUser) {
            alert("Please log in to add items to your cart!");
            window.location.href = "index.html"; 
            return;
        }

        const itemBox = button.closest('.item');
        
        const itemName = itemBox.querySelector('h3').innerText;
        const itemPriceText = itemBox.querySelector('h4').innerText; 
        const itemPrice = parseFloat(itemPriceText.replace('$', '').trim()); 
        const itemImage = itemBox.querySelector('img').src;

        const qtyInput = itemBox.querySelector('.qty-input');
        const requestedQty = qtyInput ? parseInt(qtyInput.value) : 1;

        if (requestedQty < 1) {
            alert("Please enter a valid quantity.");
            return;
        }

        const maxAvailable = parseInt(button.getAttribute('data-available'));

        try {
            const cartRef = collection(db, "users", currentUser.uid, "cart");
            const q = query(cartRef, where("name", "==", itemName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const existingDoc = querySnapshot.docs[0];
                const currentQuantity = existingDoc.data().quantity || 1;
                
                if (currentQuantity + requestedQty > maxAvailable) {
                    alert(`Sorry, we only have ${maxAvailable} in stock! You already have ${currentQuantity} in your cart.`);
                    return; 
                }
                
                await updateDoc(doc(db, "users", currentUser.uid, "cart", existingDoc.id), {
                    quantity: currentQuantity + requestedQty
                });
            } else {
                if (requestedQty > maxAvailable) {
                    alert(`Sorry, we only have ${maxAvailable} in stock!`);
                    return;
                }

                await addDoc(cartRef, {
                    name: itemName,
                    price: itemPrice,
                    image: itemImage,
                    quantity: requestedQty,
                    addedAt: new Date()
                });
            }
            
            const originalText = button.innerText;
            button.innerText = "Added!";
            button.style.backgroundColor = "var(--second-color)";
            button.style.color = "#000";
            
            setTimeout(() => {
                button.innerText = originalText;
                button.style.backgroundColor = "var(--main-color)";
                button.style.color = "var(--main-text-color)";
            }, 1500);

        } catch (error) {
            alert("Error adding item: " + error.message);
        }
    }
});


// ==========================================
//  REAL-TIME CART COUNTER
// ==========================================

function startCartListener() {
    if (!currentUser) return;
    const cartRef = collection(db, "users", currentUser.uid, "cart");
    onSnapshot(cartRef, (snapshot) => {
        const totalItems = snapshot.docs.length;
        const cartBadge = document.querySelector('.user .cart span');
        if (cartBadge) {
            cartBadge.innerText = totalItems;
        }
    });
}

// ==========================================
//  LOGOUT / PROFILE ICON LOGIC
// ==========================================

const profileIcon = document.querySelector('.user-profile');
if (profileIcon) {
    profileIcon.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (currentUser) {
            if (confirm("Do you want to log out?")) {
                signOut(auth).then(() => {
                    window.location.href = "index.html"; 
                });
            }
        } else {
            window.location.href = "index.html";
        }
    });
}