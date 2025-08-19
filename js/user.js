// document.getElementById("logout").addEventListener("click",()=>{location.href="./index.html" })

const supabaseUrl = 'https://sdwhmvkylqoqgfwqherf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd2htdmt5bHFvcWdmd3FoZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzIwNDgsImV4cCI6MjA3MDc0ODA0OH0.XVVIi60ktD6grXfBmv0Eccn_eXZbX9vyhrRwlt3bAAM";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


async function loadItems() {
    const { data, error } = await supabase
        .from('Items')
        .select('*');

    console.log("Data from supabase:", data);
    console.log("Error:", error);

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    const container = document.getElementById("itemsCon");
    container.innerHTML = "";

    data.forEach(item => {
        let card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
            <div class="card shadow-sm">
                <img src="${item.img_url}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">${item.description}</p>
                    <p class="fw-bold text-success">Price: $${item.price}</p>
                    <div class="d-flex justify-content-between">
                         <button class="btn btn-primary addcart" data-id="${item.id}">Add to cart</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("addcart")) {
        let card = e.target.closest(".card");
        let name = card.querySelector(".card-title").textContent;
        let price = card.querySelector(".text-success").textContent;
        
        // 👇 item.id database se lena hoga
        let itemId = e.target.getAttribute("data-id");

        // yahan current user ka id lena hoga
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Please login first!");
            return;
        }

        let { data, error } = await supabase
            .from("cart_items")
            .insert([{ user_id: user.id, product_id: itemId, quantity: 1 }]);

if (error) {
    console.error("Error adding to cart:", error.message, error.details);
    alert("Error: " + error.message);
}
 else {
            alert(`${name} added to cart!`);
        }
    }
});
document.getElementById("viewCart").addEventListener("click", async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert("Please login first!");
        return;
    }

    // Cart ke andar sirf current user ka data lana
    let { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, Items(name, price, img_url)") // 👈 relation with Items
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching cart:", error);
        return;
    }

    console.log("Cart Data:", data);

    const container = document.getElementById("cartCon");
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    data.forEach(cartItem => {
        let card = document.createElement("div");
        card.className = "col-md-4 mb-4";
        card.innerHTML = `
            <div class="card shadow-sm">
                <img src="${cartItem.Items.img_url}" class="card-img-top" alt="${cartItem.Items.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${cartItem.Items.name}</h5>
                    <p class="fw-bold text-success">Price: $${cartItem.Items.price}</p>
                    <p>Quantity: ${cartItem.quantity}</p>
                    <button class="btn btn-danger removeCart" data-id="${cartItem.id}">Remove</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("removeCart")) {
        let cartId = e.target.getAttribute("data-id");

        let { error } = await supabase
            .from("cart_items")
            .delete()
            .eq("id", cartId);

        if (error) {
            console.error("Error removing item:", error);
        } else {
            alert("Item removed from cart!");
            document.getElementById("viewCart").click(); // refresh cart
        }
    }
});


loadItems()