(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    const elements = select(el, all);
    if (all && elements) {
      elements.forEach((e) => e.addEventListener(type, listener));
    } else if (elements) {
      elements.addEventListener(type, listener);
    }
  };

  /**
   * Sidebar toggle
   */
  if (select(".toggle-sidebar-btn")) {
    on("click", ".toggle-sidebar-btn", () => {
      select("body").classList.toggle("toggle-sidebar");
    });
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select("#navbar .scrollto", true);
  const navbarlinksActive = () => {
    let position = window.scrollY + 200;
    navbarlinks.forEach((navbarlink) => {
      if (!navbarlink.hash) return;
      let section = select(navbarlink.hash);
      if (!section) return;
      if (
        position >= section.offsetTop &&
        position <= section.offsetTop + section.offsetHeight
      ) {
        navbarlink.classList.add("active");
      } else {
        navbarlink.classList.remove("active");
      }
    });
  };
  window.addEventListener("load", navbarlinksActive);
  window.addEventListener("scroll", navbarlinksActive);

  /**
   * Back to top button
   */
  let backtotop = select(".back-to-top");
  const toggleBacktotop = () => {
    if (backtotop) {
      if (window.scrollY > 100) {
        backtotop.classList.add("active");
      } else {
        backtotop.classList.remove("active");
      }
    }
  };
  window.addEventListener("load", toggleBacktotop);
  window.addEventListener("scroll", toggleBacktotop);

  /**
   * Initiate Bootstrap validation check
   */
  const needsValidation = document.querySelectorAll(".needs-validation");
  needsValidation.forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // **Verificar si el usuario está autenticado**
  if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "login.html";
  }

  // **Función para cerrar sesión**
  const logoutBtn = select("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      window.location.href = "login.html";
    });
  }
})();

document.addEventListener("DOMContentLoaded", function () {
    const productForm = document.getElementById("productForm");
    const productosTableBody = document.getElementById("productosTableBody");
    const addProductModal = new bootstrap.Modal(
      document.getElementById("addProductModal")
    );
  
    // Cargar productos desde localStorage o establecer un array vacío si no hay productos guardados
    let productos = JSON.parse(localStorage.getItem("productos")) || [];
  
    // Función para renderizar productos en la tabla
    function renderProductos() {
      const tableBody = document.querySelector("#productosTableBody");
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
  
      // Limpiar filas anteriores
      tableBody.innerHTML = "";
  
      // Recorrer productos y agregar cada uno a la tabla
      productos.forEach((producto, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${producto.name}</td>
          <td>${producto.category}</td>
          <td>${producto.price}</td>
          <td>${producto.stock}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editProduct('${producto.id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${producto.id}')">Eliminar</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
    }
  
    // Evento de envío del formulario para guardar o actualizar productos
    productForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevenir el envío por defecto del formulario
  
      // Obtener los valores de los campos del formulario
      const newProduct = {
        id: productForm.getAttribute("data-edit-id") || Date.now().toString(), // Generar un ID único si no existe
        name: productForm.productName.value.trim(),
        category: productForm.productCategory.value.trim(),
        price: productForm.productPrice.value.trim(),
        stock: productForm.productStock.value.trim(),
      };
  
      // Validar campos obligatorios
      if (
        !newProduct.name ||
        !newProduct.category ||
        !newProduct.price ||
        !newProduct.stock
      ) {
        Swal.fire({
          icon: "warning",
          title: "Faltan datos",
          text: "Por favor, complete todos los campos",
          confirmButtonText: "OK",
        });
        return;
      }
  
      // Obtener productos actuales desde localStorage
      let productos = JSON.parse(localStorage.getItem("productos")) || [];
  
      // Verificar si estamos editando un producto existente
      const existingIndex = productos.findIndex(
        (producto) => producto.id === newProduct.id
      );
  
      if (existingIndex !== -1) {
        // Si el producto existe, actualizarlo
        productos[existingIndex] = newProduct;
      } else {
        // Si es un nuevo producto, agregarlo al array
        productos.push(newProduct);
      }
  
      // Guardar el array actualizado en localStorage
      localStorage.setItem("productos", JSON.stringify(productos));
  
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: "success",
        title: "Producto guardado",
        text: "El producto se ha guardado correctamente",
        confirmButtonText: "OK",
      });
  
      // Cerrar el modal, limpiar el formulario y renderizar la tabla
      addProductModal.hide();
      productForm.reset();
      productForm.removeAttribute("data-edit-id");
      renderProductos();
    });
  
    // Función para buscar productos
    function searchProduct() {
      const searchTerm = document
        .getElementById("searchProductInput")
        .value.toLowerCase();
      const rows = document.querySelectorAll("#productosTableBody tr");
  
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });
    }
  
    // Función para editar un producto
    function editProduct(productId) {
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
      const producto = productos.find((p) => p.id === productId);
  
      if (producto) {
        // Llenar el formulario con los datos del producto
        document.getElementById("productName").value = producto.name;
        document.getElementById("productCategory").value = producto.category;
        document.getElementById("productPrice").value = producto.price;
        document.getElementById("productStock").value = producto.stock;
  
        // Establecer el ID del producto en el formulario para saber que estamos editando
        productForm.setAttribute("data-edit-id", producto.id);
  
        // Mostrar el modal para edición
        addProductModal.show();
      }
    }
  
    // Función para eliminar un producto
    function deleteProduct(productId) {
      Swal.fire({
        title: "¿Está seguro?",
        text: "¡No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          // Obtener la lista actual de productos desde localStorage
          let productos = JSON.parse(localStorage.getItem("productos")) || [];
  
          // Buscar el producto por su ID
          const index = productos.findIndex((producto) => producto.id === productId);
  
          if (index !== -1) {
            // Eliminar el producto si se encontró el ID
            productos.splice(index, 1);
            localStorage.setItem("productos", JSON.stringify(productos));
  
            // Mostrar mensaje de éxito
            Swal.fire("Eliminado", "Producto eliminado correctamente", "success");
  
            // Renderizar nuevamente la tabla
            renderProductos();
          } else {
            Swal.fire("Error", "Producto no encontrado", "error");
          }
        }
      });
    }
  
    // Renderizar la tabla de productos al cargar la página
    renderProductos();
  
    // Exponer las funciones al ámbito global para poder ser usadas en los botones
    window.editProduct = editProduct;
    window.deleteProduct = deleteProduct;
  });
  