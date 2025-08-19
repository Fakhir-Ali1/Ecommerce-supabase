document.getElementById("logout").addEventListener("click",()=>{location.href="./index.html" })

const supabaseUrl = 'https://sdwhmvkylqoqgfwqherf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd2htdmt5bHFvcWdmd3FoZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzIwNDgsImV4cCI6MjA3MDc0ODA0OH0.XVVIi60ktD6grXfBmv0Eccn_eXZbX9vyhrRwlt3bAAM";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById("sub").addEventListener("click", async () => {
    let itemName = document.getElementById("iName").value;
    let itemDesc = document.getElementById("iDesc").value;
    let itemPrice = document.getElementById("iPrice").value;
    let itemImage = document.getElementById("img").files[0];

    if (!itemName || !itemDesc || !itemPrice || !itemImage) {
        alert("Please fill all fields and select an image.");
        return;
    }

    // Step 1: Unique filename
    let fileName = `public/${Date.now()}_${itemImage.name}`;

    // Step 2: Upload image to Supabase bucket
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('items-images') // apna bucket name
        .upload(fileName, itemImage, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error("Image upload failed:", uploadError);
        alert("Image upload failed! Check console for details.");
        return;
    }

    // Step 3: Get public URL
    const { data: publicUrlData } = supabase
        .storage
        .from('items-images')
        .getPublicUrl(fileName);

    let imageUrl = publicUrlData.publicUrl;

    // Step 4: Insert item data into database
    const { error: dbError } = await supabase
        .from('Items')
        .insert([
            { name: itemName, description: itemDesc, price: itemPrice, img_url: imageUrl }
        ]);

    if (dbError) {
        console.error("Database insert failed:", dbError);
        alert("Database insert failed! Check console for details.");
    } else {
        alert("Item added successfully!");
        console.log("Item added with image:", imageUrl);
    }
});

async function loadItems() {
    const { data, error } = await supabase
        .from('Items')
        .select('*');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }

    const container = document.getElementById("itemsContainer");
    container.innerHTML = ""; // Clear old data

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
                         <button class="btn btn-primary editBtn">Edit</button>
                         <button class="btn btn-danger deleteBtn">Delete</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners alag se lagao
        card.querySelector(".deleteBtn").addEventListener("click", () => deleteItem(item.id));
        card.querySelector(".editBtn").addEventListener("click", () =>
            openEditModal(item.id, item.name, item.description, item.price)
        );

        container.appendChild(card);
    });
}
document.getElementById("updateBtn").addEventListener("click", updateItem);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

async function deleteItem(id) {
    if (!confirm("Are you sure to delete this item?")) return;

    const { error } = await supabase.from("Items").delete().eq("id", id);

    if (error) {
        console.error("Delete error:", error);
        alert("Delete failed!");
    } else {
        alert("Item deleted successfully!");
        loadItems();
    }
}
let editItemId = null;

// Modal open karke old values dikhana
function openEditModal(id, name, description, price) {
    editItemId = id;
    document.getElementById("editId").value = id;
    document.getElementById("editName").value = name;
    document.getElementById("editDesc").value = description;
    document.getElementById("editPrice").value = price;
    document.getElementById("editImage").value = ""; // reset file input
    document.getElementById("editModal").style.display = "block";
}

// Modal close
function closeModal() {
    document.getElementById("editModal").style.display = "none";
}

// Update item in Supabase
// Update item in Supabase
async function updateItem() {
    let id = document.getElementById("editId").value;
    let newName = document.getElementById("editName").value;
    let newDesc = document.getElementById("editDesc").value;
    let newPrice = document.getElementById("editPrice").value;
    let imageFile = document.getElementById("editImage").files[0];

    let newImageUrl = null;

    if (imageFile) {
        let fileName = `public/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase
            .storage
            .from("items-images")
            .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });

        if (uploadError) {
            console.error("Image upload failed:", uploadError);
            alert("Image upload failed!");
            return;
        }

        // ✅ Correct way to get public URL in Supabase v2
        const { data: urlData, error: urlError } = supabase
            .storage
            .from("items-images")
            .getPublicUrl(fileName);

        if (urlError) {
            console.error("Error getting image URL:", urlError);
            alert("Image URL fetch failed!");
            return;
        }

        newImageUrl = urlData.publicUrl; // ✅ correct
    }

    // ✅ Update item in DB
    const { error: updateError } = await supabase
        .from("Items")
        .update({
            name: newName,
            description: newDesc,
            price: newPrice,
            ...(newImageUrl && { img_url: newImageUrl })
        })
        .eq("id", id);

    if (updateError) {
        console.error("Update error:", updateError);
        alert("Update failed!");
    } else {
        alert("Item updated successfully!");
        closeModal();
        loadItems();
    }
}

// Auto load
loadItems();
