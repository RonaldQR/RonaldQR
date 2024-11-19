document.addEventListener("DOMContentLoaded", function () {
    const productForm = document.getElementById("productForm");
    const productsTableBody = document.getElementById("productsTableBody");
    const productModal = new bootstrap.Modal(document.getElementById("productModal"));
    const searchInput = document.getElementById("searchProduct");

    let products = JSON.parse(localStorage.getItem("products")) || [];

    // Renderizar la tabla de productos
    function renderProducts() {
        productsTableBody.innerHTML = "";
        products.forEach((product, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.stock > 0 ? "Disponible" : "Agotado"}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editProduct(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${index})">Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    }

    // Añadir o actualizar producto
    productForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = productForm.productName.value.trim();
        const category = productForm.productCategory.value.trim();
        const price = parseFloat(productForm.productPrice.value);
        const stock = parseInt(productForm.productStock.value);

        if (!name || !category || isNaN(price) || isNaN(stock)) {
            Swal.fire("Error", "Por favor, complete todos los campos.", "error");
            return;
        }

        const productId = productForm.getAttribute("data-edit-id");
        const newProduct = { name, category, price, stock };

        if (productId) {
            products[productId] = newProduct;
            Swal.fire("Actualizado", "Producto actualizado correctamente.", "success");
            productForm.removeAttribute("data-edit-id");
        } else {
            products.push(newProduct);
            Swal.fire("Guardado", "Producto añadido correctamente.", "success");
        }

        localStorage.setItem("products", JSON.stringify(products));
        renderProducts();
        productForm.reset();
        productModal.hide();
    });

    // Editar producto
    window.editProduct = function (index) {
        const product = products[index];
        productForm.productName.value = product.name;
        productForm.productCategory.value = product.category;
        productForm.productPrice.value = product.price;
        productForm.productStock.value = product.stock;
        productForm.setAttribute("data-edit-id", index);
        productModal.show();
    };

    // Eliminar producto
    window.deleteProduct = function (index) {
        Swal.fire({
            title: "¿Está seguro?",
            text: "No podrás revertir esta acción.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                products.splice(index, 1);
                localStorage.setItem("products", JSON.stringify(products));
                Swal.fire("Eliminado", "Producto eliminado correctamente.", "success");
                renderProducts();
            }
        });
    };

    // Búsqueda de productos
    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = productsTableBody.querySelectorAll("tr");
        rows.forEach((row) => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? "" : "none";
        });
    });

    renderProducts();
});
