document.addEventListener("DOMContentLoaded", function () {
  const ventaForm = document.getElementById("ventaForm");
  const ventasTableBody = document.getElementById("ventasTableBody");
  const ventaModal = new bootstrap.Modal(document.getElementById("ventaModal"));
  const searchVentaInput = document.getElementById("searchVenta");

  let ventas = JSON.parse(localStorage.getItem("ventas")) || [];

  // Función para renderizar las ventas en la tabla
  function renderVentas() {
    ventasTableBody.innerHTML = "";
    ventas.forEach((venta, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${index + 1}</td>
                <td>${venta.cliente}</td>
                <td>${venta.productos
                  .map((p) => `${p.nombre} (x${p.cantidad})`)
                  .join(", ")}</td>
                <td>${venta.fecha}</td>
                <td>${venta.total}</td>
                <td>${venta.metodoPago}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editVenta(${index})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteVenta(${index})">Eliminar</button>
                </td>
            `;
      ventasTableBody.appendChild(row);
    });
  }

  // Guardar o actualizar una venta
  ventaForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const cliente = document.getElementById("cliente").value.trim();
    const metodoPago = document.getElementById("metodoPago").value;
    const fecha = new Date().toLocaleDateString();
    const productosContainer = document.getElementById("productosContainer");
    const productoRows = productosContainer.querySelectorAll(".input-group");

    if (!cliente || !metodoPago || productoRows.length === 0) {
      Swal.fire(
        "Error",
        "Por favor complete todos los campos obligatorios.",
        "error"
      );
      return;
    }

    const productos = Array.from(productoRows).map((row) => ({
      id: row.querySelector(".producto-select").value,
      nombre: row.querySelector(".producto-select option:checked").text,
      precio: parseFloat(row.querySelector(".precio-producto").value),
      cantidad: parseInt(row.querySelector(".cantidad-producto").value, 10),
    }));

    const total = productos.reduce(
      (acc, prod) => acc + prod.precio * prod.cantidad,
      0
    );

    const nuevaVenta = {
      cliente,
      metodoPago,
      fecha,
      productos,
      total: `$${total.toFixed(2)}`,
    };

    const ventaId = ventaForm.getAttribute("data-edit-id");
    if (ventaId) {
      ventas[parseInt(ventaId)] = nuevaVenta;
      Swal.fire(
        "Actualizado",
        "La venta fue actualizada con éxito.",
        "success"
      );
      ventaForm.removeAttribute("data-edit-id");
    } else {
      ventas.push(nuevaVenta);
      Swal.fire("Guardado", "La venta fue registrada con éxito.", "success");
    }

    localStorage.setItem("ventas", JSON.stringify(ventas));
    ventaForm.reset();
    ventaModal.hide();
    renderVentas();
  });

  // Editar venta
  window.editVenta = function (index) {
    const venta = ventas[index];
    document.getElementById("cliente").value = venta.cliente;
    document.getElementById("metodoPago").value = venta.metodoPago;

    const productosContainer = document.getElementById("productosContainer");
    productosContainer.innerHTML = "";
    venta.productos.forEach((prod) => {
      const productRow = `
                <div class="input-group mb-2">
                    <select class="form-select producto-select" onchange="updatePrecio(this)" required>
                        <option value="${prod.id}" selected>${prod.nombre}</option>
                    </select>
                    <input type="number" class="form-control precio-producto" value="${prod.precio}" readonly>
                    <input type="number" class="form-control cantidad-producto" value="${prod.cantidad}" required>
                    <button class="btn btn-danger" type="button" onclick="removeProduct(this)">-</button>
                </div>
            `;
      productosContainer.insertAdjacentHTML("beforeend", productRow);
    });

    ventaForm.setAttribute("data-edit-id", index);
    ventaModal.show();
  };

  // Eliminar venta
  window.deleteVenta = function (index) {
    Swal.fire({
      title: "¿Está seguro?",
      text: "No podrá revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        ventas.splice(index, 1);
        localStorage.setItem("ventas", JSON.stringify(ventas));
        Swal.fire("Eliminado", "La venta fue eliminada con éxito.", "success");
        renderVentas();
      }
    });
  };

  // Buscar ventas
  searchVentaInput.addEventListener("input", function () {
    const searchTerm = searchVentaInput.value.toLowerCase();
    const rows = ventasTableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(searchTerm) ? "" : "none";
    });
  });

  // Cargar clientes
  function loadClientes() {
    const clienteSelect = document.getElementById("cliente");
    const clients = JSON.parse(localStorage.getItem("clients")) || [];

    clienteSelect.innerHTML =
      '<option value="">Seleccione un cliente...</option>';
    clients.forEach((client) => {
      clienteSelect.innerHTML += `<option value="${client.id}">${client.name}</option>`;
    });
  }

  // Cargar productos
  function loadProductos() {
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    const productoSelects = document.querySelectorAll(".producto-select");

    productoSelects.forEach((select) => {
      select.innerHTML = '<option value="">Seleccione un producto...</option>';
      productos.forEach((producto) => {
        select.innerHTML += `<option value="${producto.id}" data-precio="${producto.price}">
                    ${producto.name} - $${producto.price}
                </option>`;
      });
    });
  }

  // Actualizar precio al seleccionar producto
  window.updatePrecio = function (selectElement) {
    const precioField =
      selectElement.parentElement.querySelector(".precio-producto");
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const precio = selectedOption.getAttribute("data-precio");
    precioField.value = precio || "";
  };

  // Añadir fila para producto
  window.addProduct = function () {
    const productosContainer = document.getElementById("productosContainer");
    const productRow = `
            <div class="input-group mb-2">
                <select class="form-select producto-select" onchange="updatePrecio(this)" required>
                    <option value="">Seleccione un producto...</option>
                </select>
                <input type="number" class="form-control precio-producto" placeholder="Precio" readonly>
                <input type="number" class="form-control cantidad-producto" placeholder="Cantidad" required>
                <button class="btn btn-danger" type="button" onclick="removeProduct(this)">-</button>
            </div>
        `;
    productosContainer.insertAdjacentHTML("beforeend", productRow);
    loadProductos();
  };

  // Eliminar fila de producto
  window.removeProduct = function (button) {
    button.parentElement.remove();
    calculateTotal();
  };

  // Calcular total de la venta
  function calculateTotal() {
    const productosContainer = document.getElementById("productosContainer");
    const productoRows = productosContainer.querySelectorAll(".input-group");

    let total = 0;
    productoRows.forEach((row) => {
      const precio =
        parseFloat(row.querySelector(".precio-producto").value) || 0;
      const cantidad =
        parseFloat(row.querySelector(".cantidad-producto").value) || 0;
      total += precio * cantidad;
    });

    document.getElementById("totalVenta").value = `$${total.toFixed(2)}`;
  }

  document
    .getElementById("productosContainer")
    .addEventListener("input", calculateTotal);

  // Cargar clientes y productos al abrir el modal
  document
    .getElementById("ventaModal")
    .addEventListener("show.bs.modal", function () {
      loadClientes();
      loadProductos();
    });

  renderVentas();
});
