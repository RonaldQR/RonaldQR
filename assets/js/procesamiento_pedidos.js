document.addEventListener("DOMContentLoaded", function () {
    const pedidoForm = document.getElementById("pedidoForm");
    const pedidosTableBody = document.getElementById("pedidosTableBody");
    const pedidoModal = new bootstrap.Modal(document.getElementById("pedidoModal"));
    const searchInput = document.getElementById("searchPedido");
    const productosContainer = document.getElementById("productosContainer");
    const totalPedido = document.getElementById("totalPedido");
  
    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  
    // Renderizar tabla de pedidos
    function renderPedidos() {
      pedidosTableBody.innerHTML = "";
      pedidos.forEach((pedido, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${pedido.cliente}</td>
          <td>${pedido.productos.map(p => `${p.nombre} (x${p.cantidad})`).join(", ")}</td>
          <td>${pedido.fecha}</td>
          <td>${pedido.total}</td>
          <td>${pedido.estado}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editPedido(${index})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deletePedido(${index})">Eliminar</button>
          </td>
        `;
        pedidosTableBody.appendChild(row);
      });
    }
  
    // Función para cargar clientes
    function loadClientes() {
      const clienteSelect = document.getElementById("cliente");
      const clients = JSON.parse(localStorage.getItem("clients")) || [];
      clienteSelect.innerHTML = '<option value="">Seleccione un cliente...</option>';
      clients.forEach((client) => {
        clienteSelect.innerHTML += `<option value="${client.id}">${client.name}</option>`;
      });
    }
  
    // Función para cargar productos
    function loadProductos() {
      const productos = JSON.parse(localStorage.getItem("productos")) || [];
      productosContainer.querySelectorAll(".producto-select").forEach((select) => {
        select.innerHTML = '<option value="">Seleccione un producto...</option>';
        productos.forEach((producto) => {
          select.innerHTML += `<option value="${producto.id}" data-precio="${producto.price}">
            ${producto.name} - $${producto.price}
          </option>`;
        });
      });
    }
  
    // Función para calcular el total
    function calculateTotal() {
      let total = 0;
      productosContainer.querySelectorAll(".input-group").forEach((row) => {
        const precio = parseFloat(row.querySelector(".precio-producto").value) || 0;
        const cantidad = parseFloat(row.querySelector(".cantidad-producto").value) || 0;
        total += precio * cantidad;
      });
      totalPedido.value = `$${total.toFixed(2)}`;
    }
  
    // Evento: Agregar un producto dinámicamente
    window.addProduct = function () {
      const productRow = `
        <div class="input-group mb-2">
          <select class="form-select producto-select" onchange="updatePrecio(this)" required>
            <option value="">Seleccione un producto...</option>
          </select>
          <input type="number" class="form-control precio-producto" placeholder="Precio" readonly>
          <input type="number" class="form-control cantidad-producto" placeholder="Cantidad" required>
          <button class="btn btn-danger" type="button" onclick="removeProduct(this)">-</button>
        </div>`;
      productosContainer.insertAdjacentHTML("beforeend", productRow);
      loadProductos();
    };
  
    // Evento: Actualizar precio del producto
    window.updatePrecio = function (selectElement) {
      const precioField = selectElement.parentElement.querySelector(".precio-producto");
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      precioField.value = selectedOption.getAttribute("data-precio") || "";
      calculateTotal();
    };
  
    // Evento: Eliminar un producto
    window.removeProduct = function (button) {
      button.parentElement.remove();
      calculateTotal();
    };
  
    // Guardar pedido
    pedidoForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const cliente = pedidoForm.cliente.value;
      const direccion = pedidoForm.direccion.value;
      const metodoPago = pedidoForm.metodoPago.value;
      const observaciones = pedidoForm.observaciones.value;
  
      const productos = Array.from(productosContainer.querySelectorAll(".input-group")).map((row) => ({
        id: row.querySelector(".producto-select").value,
        nombre: row.querySelector(".producto-select option:checked").textContent,
        cantidad: parseFloat(row.querySelector(".cantidad-producto").value),
        precio: parseFloat(row.querySelector(".precio-producto").value),
      }));
  
      if (!cliente || productos.length === 0 || !metodoPago) {
        Swal.fire("Error", "Complete todos los campos obligatorios.", "error");
        return;
      }
  
      const nuevoPedido = {
        cliente,
        direccion,
        metodoPago,
        productos,
        observaciones,
        fecha: new Date().toLocaleDateString(),
        total: `$${productos.reduce((sum, p) => sum + p.precio * p.cantidad, 0).toFixed(2)}`,
        estado: "Pendiente",
      };
  
      pedidos.push(nuevoPedido);
      localStorage.setItem("pedidos", JSON.stringify(pedidos));
  
      Swal.fire("Guardado", "El pedido se guardó correctamente.", "success");
      pedidoForm.reset();
      pedidoModal.hide();
      renderPedidos();
    });
  
    // Función para buscar pedidos
    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();
      pedidosTableBody.querySelectorAll("tr").forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? "" : "none";
      });
    });
  
    // Inicializar
    document.getElementById("pedidoModal").addEventListener("show.bs.modal", () => {
      loadClientes();
      loadProductos();
    });
    renderPedidos();
  });
  